// One set on the lift detail page: its exercises, plus buttons to delete the set
// or add another exercise to it (a superset).

import { useState } from "react";
import { createLiftSubset, deleteLiftSet } from "../api.js";
import ExerciseSelect from "./ExerciseSelect.jsx";
import LiftSubsetRow from "./LiftSubsetRow.jsx";
import { numberOrNull, nextPosition } from "../formHelpers.js";

function LiftSetCard({ set, exercises, muscleGroups, onChanged, onError }) {
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [reps, setReps] = useState("");
  const [rir, setRir] = useState("");
  const [weight, setWeight] = useState("");

  async function handleAddExercise(event) {
    event.preventDefault();
    try {
      await createLiftSubset(set.id, {
        exercise_id: Number(selectedExerciseId),
        position: nextPosition(set.subsets),
        reps: numberOrNull(reps),
        rir: numberOrNull(rir),
        weight: numberOrNull(weight),
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

  async function handleDeleteSet() {
    if (!window.confirm("Delete this whole set?")) {
      return;
    }
    try {
      await deleteLiftSet(set.id);
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  }

  return (
    <div className="card">
      <h3>Set {set.position}</h3>
      <ul className="list">
        {set.subsets.map((subset) => (
          <LiftSubsetRow
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
        <button type="submit">Add exercise</button>
      </form>

      <button type="button" onClick={handleDeleteSet}>Delete set</button>
    </div>
  );
}

export default LiftSetCard;
