// Which sets are ticked in a lifting day's tables, for the actions toolbar above them.
// Shared by the lift page and each program day.

import { useState } from "react";

// sets: the day's sets, in position order.
export function useSetSelection(sets) {
  const [chosenIds, setChosenIds] = useState([]);
  // The set showing the "add exercise" input row, if any.
  const [addingToSetId, setAddingToSetId] = useState(null);

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
