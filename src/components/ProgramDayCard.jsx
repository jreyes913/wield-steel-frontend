// One day of a program: a name bar (rename or delete the day) above a table of
// its sets, with a row at the bottom to add a new set.

import { useState } from "react";
import { updateProgramDay, deleteProgramDay, createProgramSet } from "../api.js";
import ExerciseSelect from "./ExerciseSelect.jsx";
import ProgramSetGroup from "./ProgramSetGroup.jsx";
import { numberOrNull, nextPosition } from "../formHelpers.js";

function ProgramDayCard({ day, exercises, muscleGroups, onChanged, onError }) {
  const [dayName, setDayName] = useState(day.name);

  // Fields for the "new set" row at the bottom of the table.
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

  async function handleAddSet() {
    if (selectedExerciseId === "") {
      onError("Choose an exercise first.");
      return;
    }
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
      <form onSubmit={handleRename} className="inline-form">
        <input
          aria-label="Day name"
          value={dayName}
          onChange={(e) => setDayName(e.target.value)}
          required
        />
        <button type="submit">Rename</button>
        <button type="button" className="danger" onClick={handleDeleteDay}>Delete day</button>
      </form>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Reps</th>
              <th></th>
            </tr>
          </thead>
          {/* Each set is its own <tbody>, so its rows stay visually grouped. */}
          {day.sets.map((set) => (
            <ProgramSetGroup
              key={set.id}
              set={set}
              dayId={day.id}
              nextSetPosition={nextPosition(day.sets)}
              exercises={exercises}
              muscleGroups={muscleGroups}
              onChanged={onChanged}
              onError={onError}
            />
          ))}
          <tfoot>
            <tr className="set-header">
              <td colSpan={3}>New set</td>
            </tr>
            <tr className="new-row">
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
                <button type="button" className="primary" onClick={handleAddSet}>Add set</button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default ProgramDayCard;
