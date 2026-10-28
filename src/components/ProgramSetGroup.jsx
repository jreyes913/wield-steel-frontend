// One set inside a program day's table: a "Set N" header row, one row per exercise,
// and a row to add another exercise (a superset).
// It returns a <tbody> because a table may hold many, and each one is a visual group.

import { useState } from "react";
import { createProgramSet, createProgramSubset, deleteProgramSet } from "../api.js";
import ExerciseSelect from "./ExerciseSelect.jsx";
import ProgramSubsetRow from "./ProgramSubsetRow.jsx";
import { numberOrNull, nextPosition } from "../formHelpers.js";

// dayId and nextSetPosition are only needed to copy the set onto the end of the day.
function ProgramSetGroup({ set, dayId, nextSetPosition, exercises, muscleGroups, onChanged, onError }) {
  // The "add exercise" row stays hidden until asked for, so a normal set stays compact.
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [reps, setReps] = useState("");

  async function handleAddExercise() {
    if (selectedExerciseId === "") {
      onError("Choose an exercise first.");
      return;
    }
    try {
      await createProgramSubset(set.id, {
        exercise_id: Number(selectedExerciseId),
        position: nextPosition(set.subsets),
        reps: numberOrNull(reps),
      });
      setSelectedExerciseId("");
      setReps("");
      setIsAddingExercise(false);
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  }

  // Creates a new set at the end of the day with the same exercises and reps.
  // One request creates the set and all of its subsets together.
  async function handleCopySet() {
    try {
      await createProgramSet(dayId, {
        position: nextSetPosition,
        subsets: set.subsets.map((subset) => ({
          exercise_id: subset.exercise.id,
          position: subset.position,
          reps: subset.reps,
        })),
      });
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
    <tbody>
      <tr className="set-header">
        <td colSpan={2}>Set {set.position}</td>
        <td className="actions">
          <button type="button" onClick={handleCopySet}>Copy set</button>
          <button type="button" className="danger" onClick={handleDeleteSet}>Delete set</button>
        </td>
      </tr>

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

      {!isAddingExercise && (
        <tr>
          <td colSpan={3}>
            <button type="button" onClick={() => setIsAddingExercise(true)}>
              + Add exercise to this set
            </button>
          </td>
        </tr>
      )}

      {isAddingExercise && (
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
            <button type="button" className="primary" onClick={handleAddExercise}>Add</button>
            <button type="button" onClick={() => setIsAddingExercise(false)}>Cancel</button>
          </td>
        </tr>
      )}
    </tbody>
  );
}

export default ProgramSetGroup;
