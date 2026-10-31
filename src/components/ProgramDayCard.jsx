// One day of a program: a name bar (rename or delete the day) above its sets, one
// collapsible table per block (sets with the same exercises; see blocks.js). A
// toolbar on top acts on the ticked sets (add an exercise, copy, delete), and a
// last table adds a new set. Blocks start at A on every day.

import { useState } from "react";
import { updateProgramDay, deleteProgramDay, createProgramSet, deleteProgramSet } from "../api.js";
import ExerciseSelect from "./ExerciseSelect.jsx";
import ProgramSetGroup from "./ProgramSetGroup.jsx";
import SetActionsToolbar from "./SetActionsToolbar.jsx";
import SetBlock from "./SetBlock.jsx";
import { groupSetsIntoBlocks } from "../blocks.js";
import { numberOrNull, nextPosition } from "../formHelpers.js";
import { useSetSelection } from "../setSelection.js";

// Every table in a day shares these column widths, so stacked tables line up.
function ProgramColumns() {
  return (
    <colgroup>
      <col className="col-select" />
      <col className="col-set" />
      <col />
      <col className="col-num" />
      <col className="col-actions" />
    </colgroup>
  );
}

function ProgramDayCard({ day, exercises, muscleGroups, onChanged, onError }) {
  const [dayName, setDayName] = useState(day.name);

  // Fields for the "new set" row at the bottom of the table.
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [reps, setReps] = useState("");

  const selection = useSetSelection(day.sets);

  async function handleRename(event) {
    event.preventDefault();
    try {
      await updateProgramDay(day.id, dayName);
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  }

  async function handleDeleteDay() {
    if (!window.confirm(`Delete day "${day.name}" and its sets?`)) {
      return;
    }
    try {
      await deleteProgramDay(day.id);
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  }

  async function handleAddSet() {
    if (selectedExerciseId === "") {
      onError("Choose an exercise first.");
      return;
    }
    try {
      await createProgramSet(day.id, {
        position: nextPosition(day.sets),
        subsets: [
          {
            exercise_id: Number(selectedExerciseId),
            position: 1,
            reps: numberOrNull(reps),
          },
        ],
      });
      setSelectedExerciseId("");
      setReps("");
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  }

  // Copies each ticked set onto the end of the day, in order, with the same
  // exercises and reps. One request per set creates it with its subsets.
  async function handleCopySets() {
    try {
      let position = nextPosition(day.sets);
      for (const set of selection.selectedSets) {
        await createProgramSet(day.id, {
          position: position,
          subsets: set.subsets.map((subset) => ({
            exercise_id: subset.exercise.id,
            position: subset.position,
            reps: subset.reps,
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
        await deleteProgramSet(set.id);
      }
      selection.clear();
    } catch (err) {
      onError(err.message);
    }
    onChanged();
  }

  return (
    <div className="card">
      <form onSubmit={handleRename} className="inline-form">
        <input
          aria-label="Day name"
          value={dayName}
          onChange={(e) => setDayName(e.target.value)}
          required
        />
        <button type="submit">Rename</button>
        <button type="button" className="danger" onClick={handleDeleteDay}>Delete day</button>
      </form>

      {day.sets.length > 0 && (
        <SetActionsToolbar
          selection={selection}
          onCopy={handleCopySets}
          onDelete={handleDeleteSets}
        />
      )}

      {/* Keyed by the block's exercises, so a block stays collapsed or open even
          when its letter changes. */}
      {groupSetsIntoBlocks(day.sets).map((block) => (
        <SetBlock
          key={block.key}
          block={block}
          collapsible
          forceOpen={block.sets.some((set) => set.id === selection.addingToSetId)}
        >
          <table className="data-table blocks-table">
            <ProgramColumns />
            <thead>
              <tr>
                <th className="select-cell">
                  <input
                    type="checkbox"
                    aria-label={`Select all sets in block ${block.label}`}
                    checked={selection.areAllSelected(block.sets)}
                    onChange={() => selection.toggleGroup(block.sets)}
                  />
                </th>
                <th className="set-cell">Set</th>
                <th>Exercise</th>
                <th>Reps</th>
                <th></th>
              </tr>
            </thead>
            {/* Each set is its own <tbody>, so its rows stay visually grouped. */}
            {block.sets.map((set) => (
              <ProgramSetGroup
                key={set.id}
                set={set}
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

      <section className="block">
        <div className="block-header">
          <span className="block-label">New set</span>
        </div>
        <div className="table-wrap">
          <table className="data-table blocks-table">
            <ProgramColumns />
            <tfoot>
              <tr className="new-row">
                <td className="select-cell"></td>
                <td className="set-cell"><strong>New</strong></td>
                <td>
                  <ExerciseSelect
                    exercises={exercises}
                    muscleGroups={muscleGroups}
                    value={selectedExerciseId}
                    onChange={setSelectedExerciseId}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="1"
                    aria-label="Reps"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                  />
                </td>
                <td className="actions">
                  <button type="button" className="primary" onClick={handleAddSet}>Add set</button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ProgramDayCard;
