// One set inside a program day's table: one row per exercise. The first row holds
// the set's checkbox (which picks it for the toolbar above the table) and its
// number. When the toolbar's "Add exercise" is used on this set, an input row
// appears at the end of it. It returns a <tbody> because each set is its own group.

import { useState } from "react";
import { createProgramSubset } from "../api.js";
import ExerciseSelect from "./ExerciseSelect.jsx";
import ProgramSubsetRow from "./ProgramSubsetRow.jsx";
import SetLeadingCells from "./SetLeadingCells.jsx";
import { numberOrNull, nextPosition } from "../formHelpers.js";

/**
 * exercises, muscleGroups, onChanged and onError are only needed when it is editable.
 * @param {object} props
 * @param {import("../types.js").ProgramSet} props.set
 * @param {boolean} [props.readOnly]  A friend's program: no checkboxes, buttons or inputs.
 * @param {boolean} [props.isSelected]  Whether the set is ticked.
 * @param {() => void} [props.onToggleSelected]
 * @param {boolean} [props.isAddingExercise]  Show the "add exercise" row at the end of the set.
 * @param {() => void} [props.onDoneAddingExercise]  Called when that row is added or cancelled.
 * @param {import("../types.js").Exercise[]} [props.exercises]
 * @param {import("../types.js").MuscleGroup[]} [props.muscleGroups]
 * @param {import("../types.js").OnChanged} [props.onChanged]  Reloads the program.
 * @param {import("../types.js").OnError} [props.onError]
 */
function ProgramSetGroup({
  set,
  readOnly = false,
  isSelected,
  onToggleSelected,
  isAddingExercise,
  onDoneAddingExercise,
  exercises,
  muscleGroups,
  onChanged,
  onError,
}) {
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [reps, setReps] = useState("");

  async function handleAddExercise() {
    if (selectedExerciseId === "") {
      onError("Choose an exercise first.");
      return;
    }
    try {
      await createProgramSubset(set.id, {
        exercise_id: Number(selectedExerciseId),
        position: nextPosition(set.subsets),
        reps: numberOrNull(reps),
      });
      setSelectedExerciseId("");
      setReps("");
      onDoneAddingExercise();
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  }

  function handleCancelAdd() {
    setSelectedExerciseId("");
    setReps("");
    onDoneAddingExercise();
  }

  // The checkbox and Set columns. Only the set's first row fills them in.
  function leadingCells(isFirstRow) {
    return (
      <SetLeadingCells
        set={set}
        isFirstRow={isFirstRow}
        readOnly={readOnly}
        isSelected={isSelected}
        onToggleSelected={onToggleSelected}
      />
    );
  }

  return (
    <tbody>
      {set.subsets.map((subset, index) => (
        <ProgramSubsetRow
          key={subset.id}
          subset={subset}
          leadingCells={leadingCells(index === 0)}
          readOnly={readOnly}
          exercises={exercises}
          muscleGroups={muscleGroups}
          onChanged={onChanged}
          onError={onError}
        />
      ))}

      {/* A set with no exercises left still needs a row for its checkbox and number. */}
      {set.subsets.length === 0 && (
        <tr>
          {leadingCells(true)}
          <td colSpan={readOnly ? 2 : 3}>No exercises</td>
        </tr>
      )}

      {!readOnly && isAddingExercise && (
        <tr className="new-row">
          <td className="select-cell"></td>
          <td className="set-cell"></td>
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
            <button type="button" className="primary" onClick={handleAddExercise}>Add</button>
            <button type="button" onClick={handleCancelAdd}>Cancel</button>
          </td>
        </tr>
      )}
    </tbody>
  );
}

export default ProgramSetGroup;
