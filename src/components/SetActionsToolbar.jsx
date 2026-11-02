// Bar at the top of a sets table with the actions for the ticked sets.
// Adding an exercise needs exactly one set; copy and delete work on any number.

/**
 * @param {object} props
 * @param {import("../setSelection.js").SetSelection<import("../types.js").AnySet>} props.selection
 *   From useSetSelection.
 * @param {() => void} props.onCopy  Acts on selection.selectedSets.
 * @param {() => void} props.onDelete  Acts on selection.selectedSets.
 */
function SetActionsToolbar({ selection, onCopy, onDelete }) {
  const count = selection.selectedSets.length;

  return (
    <div className="set-toolbar">
      <span className="set-toolbar-count">
        {count === 0 ? "Tick a set to act on it" : `${count} selected`}
      </span>
      <button
        type="button"
        disabled={count !== 1}
        onClick={() => selection.setAddingToSetId(selection.selectedSets[0].id)}
      >
        + Add exercise to this set
      </button>
      <button type="button" disabled={count === 0} onClick={onCopy}>
        {count > 1 ? `Copy ${count} sets` : "Copy set"}
      </button>
      <button type="button" className="danger" disabled={count === 0} onClick={onDelete}>
        {count > 1 ? `Delete ${count} sets` : "Delete set"}
      </button>
    </div>
  );
}

export default SetActionsToolbar;
