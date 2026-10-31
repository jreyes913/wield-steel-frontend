// Which sets are ticked in a sets table, for the actions toolbar above it.
// Shared by the lift table and each program day's table.

import { useState } from "react";

// sets: the table's sets, in position order.
export function useSetSelection(sets) {
  const [chosenIds, setChosenIds] = useState([]);
  // The set showing the "add exercise" input row, if any.
  const [addingToSetId, setAddingToSetId] = useState(null);

  // Filtering the current sets drops any that were deleted and keeps position order.
  const selectedSets = sets.filter((set) => chosenIds.includes(set.id));
  const allSelected = sets.length > 0 && selectedSets.length === sets.length;

  return {
    selectedSets,
    allSelected,
    isSelected: (setId) => chosenIds.includes(setId),
    toggle: (setId) =>
      setChosenIds((ids) =>
        ids.includes(setId) ? ids.filter((id) => id !== setId) : [...ids, setId]
      ),
    toggleAll: () => setChosenIds(allSelected ? [] : sets.map((set) => set.id)),
    clear: () => setChosenIds([]),
    addingToSetId: sets.some((set) => set.id === addingToSetId) ? addingToSetId : null,
    setAddingToSetId,
  };
}
