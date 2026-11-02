// What the sets toolbar's Copy and Delete buttons do to the ticked sets.
// Shared by the lift page and each program day. The two differ only in which API
// calls they make and which fields a copied set carries, so the page passes those in.

import { nextPosition } from "./formHelpers.js";

/**
 * @template {import("./types.js").AnySet} S  LiftSet or ProgramSet.
 * @param {object} options
 * @param {S[]} options.sets  The day's sets. A copy goes after the last of them.
 * @param {import("./setSelection.js").SetSelection<S>} options.selection
 * @param {(set: S, position: number) => Promise<unknown>} options.copySet
 *   Creates a copy of one set (with its subsets) at the given position.
 * @param {(set: S) => Promise<unknown>} options.deleteSet  Deletes one set.
 * @param {import("./types.js").OnChanged} options.onChanged
 * @param {import("./types.js").OnError} options.onError
 * @returns {{ handleCopySets: () => Promise<void>, handleDeleteSets: () => Promise<void> }}
 */
export function useSetActions({ sets, selection, copySet, deleteSet, onChanged, onError }) {
  // Copies each ticked set onto the end of the day, in order. One request per set
  // creates it with its subsets.
  async function handleCopySets() {
    try {
      let position = nextPosition(sets);
      for (const set of selection.selectedSets) {
        await copySet(set, position);
        position++;
      }
      selection.clear();
    } catch (err) {
      onError(err.message);
    }
    // Reload even after an error, so any sets that were copied still show.
    onChanged();
  }

  async function handleDeleteSets() {
    const count = selection.selectedSets.length;
    if (!window.confirm(count === 1 ? "Delete this whole set?" : `Delete these ${count} sets?`)) {
      return;
    }
    try {
      for (const set of selection.selectedSets) {
        await deleteSet(set);
      }
      selection.clear();
    } catch (err) {
      onError(err.message);
    }
    onChanged();
  }

  return { handleCopySets, handleDeleteSets };
}
