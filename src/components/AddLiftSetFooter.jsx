// The bottom of the lift table: a row of inputs that adds a new set (with its
// first exercise). It returns a <tfoot> so the form lives inside the same table
// as the sets it adds to.

import { useState } from "react";
import { createLiftSet } from "../api.js";
import ExerciseSelect from "./ExerciseSelect.jsx";
import { numberOrNull } from "../formHelpers.js";

// position is computed by the page, so the user never types it.
// onChanged reloads the lift; onError shows a message on the page.
function AddLiftSetFooter({ liftId, position, exercises, muscleGroups, onChanged, onError }) {
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [reps, setReps] = useState("");
  const [rir, setRir] = useState("");
  const [weight, setWeight] = useState("");

  async function handleAddSet() {
    if (selectedExerciseId === "") {
      onError("Choose an exercise first.");
      return;
    }
    try {
      await createLiftSet(liftId, {
        position: position,
        subsets: [
          {
            exercise_id: Number(selectedExerciseId),
            position: 1,
            reps: numberOrNull(reps),
            rir: numberOrNull(rir),
            weight: numberOrNull(weight),
          },
        ],
      });
      setSelectedExerciseId("");
      setReps("");
      setRir("");
      setWeight("");
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
        <td>
          <input
            type="number"
            step="1"
            aria-label="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
          />
        </td>
        <td>
          <input
            type="number"
            step="1"
            aria-label="RIR"
            value={rir}
            onChange={(e) => setRir(e.target.value)}
          />
        </td>
        <td>
          <input
            type="number"
            step="any"
            aria-label="Weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </td>
        <td className="actions">
          <button type="button" className="primary" onClick={handleAddSet}>Add set</button>
        </td>
      </tr>
    </tfoot>
  );
}

export default AddLiftSetFooter;
