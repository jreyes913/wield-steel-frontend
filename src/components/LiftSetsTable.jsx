// The table of a lift's sets. The lift detail page uses it twice:
// - normally (editable): a toolbar on top acts on the ticked sets (add an exercise,
//   copy, delete), each exercise row has Edit/Delete, and the last row adds a set;
// - readOnly: the historical comparison column, where nothing can be changed. No
//   checkboxes, buttons or inputs are rendered, and no change callbacks are needed.

import { createLiftSet, deleteLiftSet } from "../api.js";
import AddLiftSetFooter from "./AddLiftSetFooter.jsx";
import LiftSetGroup from "./LiftSetGroup.jsx";
import SetActionsToolbar from "./SetActionsToolbar.jsx";
import { nextPosition } from "../formHelpers.js";
import { useSetSelection } from "../setSelection.js";

function LiftSetsTable({ lift, readOnly = false, exercises, muscleGroups, onChanged, onError }) {
  const selection = useSetSelection(lift.sets);
  const newSetPosition = nextPosition(lift.sets);

  // Copies each ticked set onto the end of the lift, in order, with the same
  // exercises, reps, RIR and weight. One request per set creates it with its subsets.
  async function handleCopySets() {
    try {
      let position = newSetPosition;
      for (const set of selection.selectedSets) {
        await createLiftSet(lift.id, {
          position: position,
          subsets: set.subsets.map((subset) => ({
            exercise_id: subset.exercise.id,
            position: subset.position,
            reps: subset.reps,
            rir: subset.rir,
            weight: subset.weight,
          })),
        });
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
        await deleteLiftSet(set.id);
      }
      selection.clear();
    } catch (err) {
      onError(err.message);
    }
    onChanged();
  }

  return (
    <>
      {lift.sets.length === 0 && (
        <p>{readOnly ? "No sets were recorded for this lift." : "No sets yet. Add the first one in the last row."}</p>
      )}
      <div className="table-wrap">
        {!readOnly && (
          <SetActionsToolbar
            selection={selection}
            onCopy={handleCopySets}
            onDelete={handleDeleteSets}
          />
        )}
        <table className={readOnly ? "data-table data-table--read-only" : "data-table"}>
          <thead>
            <tr>
              {!readOnly && (
                <th className="select-cell">
                  <input
                    type="checkbox"
                    aria-label="Select all sets"
                    checked={selection.allSelected}
                    onChange={selection.toggleAll}
                    disabled={lift.sets.length === 0}
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
          {lift.sets.map((set) => (
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
          {!readOnly && (
            <AddLiftSetFooter
              liftId={lift.id}
              position={newSetPosition}
              exercises={exercises}
              muscleGroups={muscleGroups}
              onChanged={onChanged}
              onError={onError}
            />
          )}
        </table>
      </div>
    </>
  );
}

export default LiftSetsTable;
