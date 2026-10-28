// One exercise inside a set, shown as a table row on the lift detail page.
// "Edit" turns the cells into inputs in place; Save or Cancel turns them back.

import { useState } from "react";
import { updateLiftSubset, deleteLiftSubset } from "../api.js";
import ExerciseSelect from "./ExerciseSelect.jsx";
import { numberOrNull } from "../formHelpers.js";

function LiftSubsetRow({ subset, exercises, muscleGroups, onChanged, onError }) {
  const [isEditing, setIsEditing] = useState(false);

  // The edit fields start with the current values. "" stands in for null.
  const [selectedExerciseId, setSelectedExerciseId] = useState(String(subset.exercise.id));
  const [reps, setReps] = useState(subset.reps ?? "");
  const [rir, setRir] = useState(subset.rir ?? "");
  const [weight, setWeight] = useState(subset.weight ?? "");

  async function handleSave() {
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
      <tr>
        <td>{subset.exercise.name}</td>
        <td>{subset.reps ?? "–"}</td>
        <td>{subset.rir ?? "–"}</td>
        <td>{subset.weight ?? "–"}</td>
        <td className="actions">
          <button type="button" onClick={() => setIsEditing(true)}>Edit</button>
          <button type="button" className="danger" onClick={handleDelete}>Delete</button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
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
        <button type="button" className="primary" onClick={handleSave}>Save</button>
        <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
      </td>
    </tr>
  );
}

export default LiftSubsetRow;
