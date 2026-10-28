// One exercise inside a program set, shown as a table row on the program detail page.
// "Edit" turns the cells into inputs in place; Save or Cancel turns them back.
// (Program subsets only have reps; there is no weight or RIR in a plan.)

import { useState } from "react";
import { updateProgramSubset, deleteProgramSubset } from "../api.js";
import ExerciseSelect from "./ExerciseSelect.jsx";
import { numberOrNull } from "../formHelpers.js";

function ProgramSubsetRow({ subset, exercises, muscleGroups, onChanged, onError }) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState(String(subset.exercise.id));
  const [reps, setReps] = useState(subset.reps ?? "");

  async function handleSave() {
    try {
      await updateProgramSubset(subset.id, {
        exercise_id: Number(selectedExerciseId),
        reps: numberOrNull(String(reps)),
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
      await deleteProgramSubset(subset.id);
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
      <td className="actions">
        <button type="button" className="primary" onClick={handleSave}>Save</button>
        <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
      </td>
    </tr>
  );
}

export default ProgramSubsetRow;
