// One exercise inside a program set, on the program detail page.
// Shows exercise and reps, and switches to an edit form when "Edit" is clicked.
// (Program subsets only have reps; there is no weight or RIR in a plan.)

import { useState } from "react";
import { updateProgramSubset, deleteProgramSubset } from "../api.js";
import ExerciseSelect from "./ExerciseSelect.jsx";
import { numberOrNull } from "../formHelpers.js";

function ProgramSubsetRow({ subset, exercises, muscleGroups, onChanged, onError }) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState(String(subset.exercise.id));
  const [reps, setReps] = useState(subset.reps ?? "");

  async function handleSave(event) {
    event.preventDefault();
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
      <li>
        {subset.exercise.name}: {subset.reps ?? "–"} reps{" "}
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
        <label>
          Reps
          <input type="number" step="1" value={reps} onChange={(e) => setReps(e.target.value)} />
        </label>
        <button type="submit">Save</button>{" "}
        <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
      </form>
    </li>
  );
}

export default ProgramSubsetRow;
