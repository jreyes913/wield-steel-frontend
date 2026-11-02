// One day of a program: a name bar (rename or delete the day) above its sets, one
// collapsible table per block (sets with the same exercises; see blocks.js). A
// toolbar on top acts on the ticked sets (add an exercise, copy, delete), and a
// last table adds a new set. Blocks start at A on every day.

import { useState } from "react";
import { updateProgramDay, deleteProgramDay, createProgramSet, deleteProgramSet } from "../api.js";
import AddProgramSetFooter from "./AddProgramSetFooter.jsx";
import NewSetBlock from "./NewSetBlock.jsx";
import ProgramSetGroup from "./ProgramSetGroup.jsx";
import SetActionsToolbar from "./SetActionsToolbar.jsx";
import SetBlock from "./SetBlock.jsx";
import SetsSummary from "./SetsSummary.jsx";
import { groupSetsIntoBlocks } from "../blocks.js";
import { nextPosition } from "../formHelpers.js";
import { useSetActions } from "../setActions.js";
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

/**
 * @param {object} props
 * @param {import("../types.js").ProgramDay} props.day
 * @param {import("../types.js").Exercise[]} props.exercises
 * @param {import("../types.js").MuscleGroup[]} props.muscleGroups
 * @param {import("../types.js").OnChanged} props.onChanged  Reloads the program.
 * @param {import("../types.js").OnError} props.onError
 */
function ProgramDayCard({ day, exercises, muscleGroups, onChanged, onError }) {
  const [dayName, setDayName] = useState(day.name);

  const selection = useSetSelection(day.sets);
  const { handleCopySets, handleDeleteSets } = useSetActions({
    sets: day.sets,
    selection,
    // A copy has the same exercises and reps.
    copySet: (set, position) =>
      createProgramSet(day.id, {
        position: position,
        subsets: set.subsets.map((subset) => ({
          exercise_id: subset.exercise.id,
          position: subset.position,
          reps: subset.reps,
        })),
      }),
    deleteSet: (set) => deleteProgramSet(set.id),
    onChanged,
    onError,
  });

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

      <SetsSummary sets={day.sets} exercises={exercises} />

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

      <NewSetBlock>
        <table className="data-table blocks-table">
          <ProgramColumns />
          <AddProgramSetFooter
            dayId={day.id}
            position={nextPosition(day.sets)}
            exercises={exercises}
            muscleGroups={muscleGroups}
            onChanged={onChanged}
            onError={onError}
          />
        </table>
      </NewSetBlock>
    </div>
  );
}

export default ProgramDayCard;
