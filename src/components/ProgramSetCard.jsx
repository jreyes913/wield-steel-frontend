// One set inside a program day: its exercises, plus buttons to delete the set
// or add another exercise to it (a superset).

import { useState } from "react";
import { createProgramSubset, deleteProgramSet } from "../api.js";
import ExerciseSelect from "./ExerciseSelect.jsx";
import ProgramSubsetRow from "./ProgramSubsetRow.jsx";
import { numberOrNull, nextPosition } from "../formHelpers.js";

function ProgramSetCard({ set, exercises, muscleGroups, onChanged, onError }) {
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [reps, setReps] = useState("");

  async function handleAddExercise(event) {
    event.preventDefault();
    try {
      await createProgramSubset(set.id, {
        exercise_id: Number(selectedExerciseId),
        position: nextPosition(set.subsets),
        reps: numberOrNull(reps),
      });
      setSelectedExerciseId("");
      setReps("");
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  }

  async function handleDeleteSet() {
    if (!window.confirm("Delete this whole set?")) {
      return;
    }
    try {
      await deleteProgramSet(set.id);
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  }

  return (
    <div className="card">
      <h4>Set {set.position}</h4>
      <ul className="list">
        {set.subsets.map((subset) => (
          <ProgramSubsetRow
            key={subset.id}
            subset={subset}
            exercises={exercises}
            muscleGroups={muscleGroups}
            onChanged={onChanged}
            onError={onError}
          />
        ))}
      </ul>

      <form onSubmit={handleAddExercise}>
        <label>
          Add an exercise to this set
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
        <button type="submit">Add exercise</button>
      </form>

      <button type="button" onClick={handleDeleteSet}>Delete set</button>
    </div>
  );
}

export default ProgramSetCard;
