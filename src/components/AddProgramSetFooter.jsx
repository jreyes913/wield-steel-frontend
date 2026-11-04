// The bottom of a program day's table: a row of inputs that adds a new set (with its
// first exercise). It returns a <tfoot> so the form lives inside the same table
// as the sets it adds to. AddLiftSetFooter does the same for a lift.

import { useState } from "react";
import { createProgramSet } from "../api.js";
import ExerciseSelect from "./ExerciseSelect.jsx";
import { numberOrNull } from "../formHelpers.js";

/**
 * @param {object} props
 * @param {number} props.dayId  The program day the set is added to.
 * @param {number} props.position  Computed by the day, so the user never types it.
 * @param {import("../types.js").Exercise[]} props.exercises
 * @param {import("../types.js").MuscleGroup[]} props.muscleGroups
 * @param {import("../types.js").OnChanged} props.onChanged  Reloads the program.
 * @param {import("../types.js").OnError} props.onError  Shows a message on the page.
 */
function AddProgramSetFooter({ dayId, position, exercises, muscleGroups, onChanged, onError }) {
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [reps, setReps] = useState("");

  async function handleAddSet() {
    if (selectedExerciseId === "") {
      onError("Choose an exercise first.");
      return;
    }
    try {
      await createProgramSet(dayId, {
        position: position,
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

  return (
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
        <td className="num">
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
  );
}

export default AddProgramSetFooter;
