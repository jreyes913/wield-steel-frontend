// Form on the lift detail page that adds a new set (with its first exercise) to a lift.

import { useState } from "react";
import { createLiftSet } from "../api.js";
import ExerciseSelect from "./ExerciseSelect.jsx";
import { numberOrNull } from "../formHelpers.js";

// position is computed by the page, so the user never types it.
// onChanged reloads the lift; onError shows a message on the page.
function AddLiftSetForm({ liftId, position, exercises, muscleGroups, onChanged, onError }) {
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [reps, setReps] = useState("");
  const [rir, setRir] = useState("");
  const [weight, setWeight] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
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
    <form onSubmit={handleSubmit} className="card">
      <h2>Add a set</h2>
      <label>
        Exercise
        <ExerciseSelect
          exercises={exercises}
          muscleGroups={muscleGroups}
          value={selectedExerciseId}
          onChange={setSelectedExerciseId}
        />
      </label>
      <div className="form-row">
        <label>
          Reps
          <input type="number" step="1" value={reps} onChange={(e) => setReps(e.target.value)} />
        </label>
        <label>
          RIR
          <input type="number" step="1" value={rir} onChange={(e) => setRir(e.target.value)} />
        </label>
        <label>
          Weight
          <input
            type="number"
            step="any"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </label>
      </div>
      <button type="submit">Add set</button>
    </form>
  );
}

export default AddLiftSetForm;
