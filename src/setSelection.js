// Which sets are ticked in a lifting day's tables, for the actions toolbar above them.
// Shared by the lift page and each program day.

import { useState } from "react";

/**
 * What useSetSelection gives back. S is LiftSet or ProgramSet.
 * @template {import("./types.js").AnySet} S
 * @typedef {object} SetSelection
 * @property {S[]} selectedSets  The ticked sets, in position order.
 * @property {(setId: number) => boolean} isSelected
 * @property {(setId: number) => void} toggle  Ticks or unticks one set.
 * @property {(groupSets: S[]) => boolean} areAllSelected
 * @property {(groupSets: S[]) => void} toggleGroup
 * @property {() => void} clear  Unticks everything.
 * @property {number | null} addingToSetId  The set showing its "add exercise" row, if any.
 * @property {(setId: number | null) => void} setAddingToSetId
 */

/**
 * @template {import("./types.js").AnySet} S  LiftSet or ProgramSet.
 * @param {S[]} sets  The day's sets, in position order.
 * @returns {SetSelection<S>}
 */
export function useSetSelection(sets) {
  const [chosenIds, setChosenIds] = useState(/** @type {number[]} */ ([]));
  // The set showing the "add exercise" input row, if any.
  const [addingToSetId, setAddingToSetId] = useState(/** @type {number | null} */ (null));

  // Filtering the current sets drops any that were deleted and keeps position order.
  const selectedSets = sets.filter((set) => chosenIds.includes(set.id));

  return {
    selectedSets,
    isSelected: (setId) => chosenIds.includes(setId),
    toggle: (setId) =>
      setChosenIds((ids) =>
        ids.includes(setId) ? ids.filter((id) => id !== setId) : [...ids, setId]
      ),
    // For a block's "select all" checkbox: ticked when every set in the group is.
    areAllSelected: (groupSets) =>
      groupSets.length > 0 && groupSets.every((set) => chosenIds.includes(set.id)),
    // Ticks every set in the group, or unticks them all if they were all ticked.
    toggleGroup: (groupSets) => {
      const groupIds = groupSets.map((set) => set.id);
      setChosenIds((ids) =>
        groupIds.every((id) => ids.includes(id))
          ? ids.filter((id) => !groupIds.includes(id))
          : [...ids, ...groupIds.filter((id) => !ids.includes(id))]
      );
    },
    clear: () => setChosenIds([]),
    addingToSetId: sets.some((set) => set.id === addingToSetId) ? addingToSetId : null,
    setAddingToSetId,
  };
}
