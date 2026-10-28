// One exercise inside a set on the lift detail page.
// Shows the numbers, and switches to an edit form when "Edit" is clicked.

import { useState } from "react";
import { updateLiftSubset, deleteLiftSubset } from "../api.js";
import ExerciseSelect from "./ExerciseSelect.jsx";
import { numberOrNull } from "../formHelpers.js";

function LiftSubsetRow({ subset, exercises, muscleGroups, onChanged, onError }) {
  const [isEditing, setIsEditing] = useState(false);

  // The form fields start with the current values. "" stands in for null.
  const [selectedExerciseId, setSelectedExerciseId] = useState(String(subset.exercise.id));
  const [reps, setReps] = useState(subset.reps ?? "");
  const [rir, setRir] = useState(subset.rir ?? "");
  const [weight, setWeight] = useState(subset.weight ?? "");

  async function handleSave(event) {
    event.preventDefault();
    try {
      await updateLiftSubset(subset.id, {
        exercise_id: Number(selectedExerciseId),
        reps: numberOrNull(String(reps)),
        rir: numberOrNull(String(rir)),
        weight: numberOrNull(String(weight)),
      });
      setIsEditing(false);
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete ${subset.exercise.name} from this set?`)) {
      return;
    }
    try {
      await deleteLiftSubset(subset.id);
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  }

  if (!isEditing) {
    return (
      <li>
        {subset.exercise.name}: {subset.reps ?? "–"} reps, RIR {subset.rir ?? "–"}, weight{" "}
        {subset.weight ?? "–"}{" "}
        <button type="button" onClick={() => setIsEditing(true)}>Edit</button>{" "}
        <button type="button" onClick={handleDelete}>Delete</button>
      </li>
    );
  }

  return (
    <li>
      <form onSubmit={handleSave}>
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
        <button type="submit">Save</button>{" "}
        <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
      </form>
    </li>
  );
}

export default LiftSubsetRow;
