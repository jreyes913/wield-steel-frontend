// One day of a program: rename or delete the day, see its sets, and add a new set.

import { useState } from "react";
import { updateProgramDay, deleteProgramDay, createProgramSet } from "../api.js";
import ExerciseSelect from "./ExerciseSelect.jsx";
import ProgramSetCard from "./ProgramSetCard.jsx";
import { numberOrNull, nextPosition } from "../formHelpers.js";

function ProgramDayCard({ day, exercises, muscleGroups, onChanged, onError }) {
  const [dayName, setDayName] = useState(day.name);

  // Fields for the "add a set" form.
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [reps, setReps] = useState("");

  async function handleRename(event) {
    event.preventDefault();
    try {
      await updateProgramDay(day.id, dayName);
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  }

  async function handleDeleteDay() {
    if (!window.confirm(`Delete day "${day.name}" and its sets?`)) {
      return;
    }
    try {
      await deleteProgramDay(day.id);
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  }

  async function handleAddSet(event) {
    event.preventDefault();
    try {
      await createProgramSet(day.id, {
        position: nextPosition(day.sets),
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
    <div className="card">
      <form onSubmit={handleRename}>
        <label>
          Day name
          <input value={dayName} onChange={(e) => setDayName(e.target.value)} required />
        </label>
        <button type="submit">Rename</button>{" "}
        <button type="button" onClick={handleDeleteDay}>Delete day</button>
      </form>

      <h3>Sets</h3>
      {day.sets.length === 0 && <p>No sets yet.</p>}
      {day.sets.map((set) => (
        <ProgramSetCard
          key={set.id}
          set={set}
          exercises={exercises}
          muscleGroups={muscleGroups}
          onChanged={onChanged}
          onError={onError}
        />
      ))}

      <form onSubmit={handleAddSet}>
        <label>
          Add a set: exercise
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
        <button type="submit">Add set</button>
      </form>
    </div>
  );
}

export default ProgramDayCard;
