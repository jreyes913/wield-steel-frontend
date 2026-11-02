// The first two cells of a set's rows: the checkbox that picks the set for the
// toolbar above the table, and the set's number. Only the set's first row fills
// them in; the rest of its exercises leave them empty.
// Used by LiftSetGroup and ProgramSetGroup.

/**
 * @param {object} props
 * @param {import("../types.js").AnySet} props.set
 * @param {boolean} props.isFirstRow  True for the set's first exercise row.
 * @param {boolean} [props.readOnly]  Leave out the checkbox column (the historical comparison).
 * @param {boolean} [props.isSelected]  Whether the set is ticked.
 * @param {() => void} [props.onToggleSelected]
 */
function SetLeadingCells({ set, isFirstRow, readOnly = false, isSelected, onToggleSelected }) {
  return (
    <>
      {!readOnly && (
        <td className="select-cell">
          {isFirstRow && (
            <input
              type="checkbox"
              aria-label={`Select set ${set.position}`}
              checked={isSelected}
              onChange={onToggleSelected}
            />
          )}
        </td>
      )}
      <td className="set-cell">{isFirstRow && <strong>{set.position}</strong>}</td>
    </>
  );
}

export default SetLeadingCells;
