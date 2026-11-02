// A lift's sets, one table per block (sets with the same exercises; see blocks.js).
// The lift detail page uses it twice:
// - normally (editable): a toolbar on top acts on the ticked sets (add an exercise,
//   copy, delete), blocks can be collapsed, each exercise row has Edit/Delete, and
//   a last table adds a new set;
// - readOnly: the historical comparison column. Blocks can't be collapsed, and no
//   checkboxes, buttons or inputs are rendered.

import { createLiftSet, deleteLiftSet } from "../api.js";
import AddLiftSetFooter from "./AddLiftSetFooter.jsx";
import LiftSetGroup from "./LiftSetGroup.jsx";
import NewSetBlock from "./NewSetBlock.jsx";
import SetActionsToolbar from "./SetActionsToolbar.jsx";
import SetBlock from "./SetBlock.jsx";
import { groupSetsIntoBlocks } from "../blocks.js";
import { nextPosition } from "../formHelpers.js";
import { useSetActions } from "../setActions.js";
import { useSetSelection } from "../setSelection.js";

// Every table on the page shares these column widths, so stacked tables line up.
/** @param {{ readOnly: boolean }} props */
function LiftColumns({ readOnly }) {
  return (
    <colgroup>
      {!readOnly && <col className="col-select" />}
      <col className="col-set" />
      <col />
      <col className="col-num" />
      <col className="col-num" />
      <col className="col-num" />
      {!readOnly && <col className="col-actions" />}
    </colgroup>
  );
}

/**
 * exercises, muscleGroups, onChanged and onError are only needed when it is editable.
 * @param {object} props
 * @param {import("../types.js").Lift} props.lift
 * @param {boolean} [props.readOnly]  The historical comparison: no checkboxes, buttons or inputs.
 * @param {import("../types.js").Exercise[]} [props.exercises]
 * @param {import("../types.js").MuscleGroup[]} [props.muscleGroups]
 * @param {import("../types.js").OnChanged} [props.onChanged]  Reloads the lift.
 * @param {import("../types.js").OnError} [props.onError]
 */
function LiftSetsTable({ lift, readOnly = false, exercises, muscleGroups, onChanged, onError }) {
  const selection = useSetSelection(lift.sets);
  const newSetPosition = nextPosition(lift.sets);
  const blocks = groupSetsIntoBlocks(lift.sets);
  const tableClass = readOnly
    ? "data-table blocks-table data-table--read-only"
    : "data-table blocks-table lift-sets-table";

  const { handleCopySets, handleDeleteSets } = useSetActions({
    sets: lift.sets,
    selection,
    // A copy has the same exercises, reps, RIR and weight.
    copySet: (set, position) =>
      createLiftSet(lift.id, {
        position: position,
        subsets: set.subsets.map((subset) => ({
          exercise_id: subset.exercise.id,
          position: subset.position,
          reps: subset.reps,
          rir: subset.rir,
          weight: subset.weight,
        })),
      }),
    deleteSet: (set) => deleteLiftSet(set.id),
    onChanged,
    onError,
  });

  return (
    <>
      {lift.sets.length === 0 && (
        <p>{readOnly ? "No sets were recorded for this lift." : "No sets yet. Add the first one in the last row."}</p>
      )}
      {!readOnly && lift.sets.length > 0 && (
        <SetActionsToolbar
          selection={selection}
          onCopy={handleCopySets}
          onDelete={handleDeleteSets}
        />
      )}

      {/* Keyed by the block's exercises, so a block stays collapsed or open even
          when its letter changes. */}
      {blocks.map((block) => (
        <SetBlock
          key={block.key}
          block={block}
          collapsible={!readOnly}
          forceOpen={block.sets.some((set) => set.id === selection.addingToSetId)}
        >
          <table className={tableClass}>
            <LiftColumns readOnly={readOnly} />
            <thead>
              <tr>
                {!readOnly && (
                  <th className="select-cell">
                    <input
                      type="checkbox"
                      aria-label={`Select all sets in block ${block.label}`}
                      checked={selection.areAllSelected(block.sets)}
                      onChange={() => selection.toggleGroup(block.sets)}
                    />
                  </th>
                )}
                <th className="set-cell">Set</th>
                <th>Exercise</th>
                <th>Reps</th>
                <th>RIR</th>
                <th>Weight</th>
                {!readOnly && <th></th>}
              </tr>
            </thead>
            {/* Each set is its own <tbody>, so its rows stay visually grouped. */}
            {block.sets.map((set) => (
              <LiftSetGroup
                key={set.id}
                set={set}
                readOnly={readOnly}
                isSelected={selection.isSelected(set.id)}
                onToggleSelected={() => selection.toggle(set.id)}
                isAddingExercise={selection.addingToSetId === set.id}
                onDoneAddingExercise={() => selection.setAddingToSetId(null)}
                exercises={exercises}
                muscleGroups={muscleGroups}
                onChanged={onChanged}
                onError={onError}
              />
            ))}
          </table>
        </SetBlock>
      ))}

      {!readOnly && (
        <NewSetBlock>
          <table className={tableClass}>
            <LiftColumns readOnly={false} />
            <AddLiftSetFooter
              liftId={lift.id}
              position={newSetPosition}
              exercises={exercises}
              muscleGroups={muscleGroups}
              onChanged={onChanged}
              onError={onError}
            />
          </table>
        </NewSetBlock>
      )}
    </>
  );
}

export default LiftSetsTable;
