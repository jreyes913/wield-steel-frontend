// One set inside the lift table: one row per exercise (the set number appears in
// the Set column of the first one), then a row to add another exercise (a superset)
// that also holds the Copy set and Delete set buttons.
// It returns a <tbody> because a table may hold many, and each one is a visual group.

import { useState } from "react";
import { createLiftSet, createLiftSubset, deleteLiftSet } from "../api.js";
import ExerciseSelect from "./ExerciseSelect.jsx";
import LiftSubsetRow from "./LiftSubsetRow.jsx";
import { numberOrNull, nextPosition } from "../formHelpers.js";

// liftId and nextSetPosition are only needed to copy the set onto the end of the lift.
// readOnly (the historical comparison) shows the set without any buttons or inputs.
function LiftSetGroup({
  set,
  readOnly = false,
  liftId,
  nextSetPosition,
  exercises,
  muscleGroups,
  onChanged,
  onError,
}) {
  // The "add exercise" row stays hidden until asked for, so a normal set stays compact.
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [reps, setReps] = useState("");
  const [rir, setRir] = useState("");
  const [weight, setWeight] = useState("");

  async function handleAddExercise() {
    if (selectedExerciseId === "") {
      onError("Choose an exercise first.");
      return;
    }
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
      setIsAddingExercise(false);
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  }

  // Creates a new set at the end of the lift with the same exercises, reps, RIR and weight.
  // One request creates the set and all of its subsets together.
  async function handleCopySet() {
    try {
      await createLiftSet(liftId, {
        position: nextSetPosition,
        subsets: set.subsets.map((subset) => ({
          exercise_id: subset.exercise.id,
          position: subset.position,
          reps: subset.reps,
          rir: subset.rir,
          weight: subset.weight,
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
      await deleteLiftSet(set.id);
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  }

  // Normally the first exercise row shows the set number; with none, this row does.
  const emptySetNumber = set.subsets.length === 0 ? <strong>{set.position}</strong> : null;

  return (
    <tbody>
      {set.subsets.map((subset, index) => (
        <LiftSubsetRow
          key={subset.id}
          subset={subset}
          setNumber={index === 0 ? set.position : null}
          readOnly={readOnly}
          exercises={exercises}
          muscleGroups={muscleGroups}
          onChanged={onChanged}
          onError={onError}
        />
      ))}

      {/* A set with no exercises left still needs a row to show its number. */}
      {readOnly && set.subsets.length === 0 && (
        <tr>
          <td className="set-cell"><strong>{set.position}</strong></td>
          <td colSpan={4}>No exercises</td>
        </tr>
      )}

      {!readOnly && !isAddingExercise && (
        <tr className="set-actions-row">
          <td className="set-cell">{emptySetNumber}</td>
          <td colSpan={4}>
            <button type="button" onClick={() => setIsAddingExercise(true)}>
              + Add exercise to this set
            </button>
          </td>
          <td className="actions">
            <button type="button" onClick={handleCopySet}>Copy set</button>
            <button type="button" className="danger" onClick={handleDeleteSet}>Delete set</button>
          </td>
        </tr>
      )}

      {!readOnly && isAddingExercise && (
        <tr className="new-row">
          <td className="set-cell">{emptySetNumber}</td>
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
            <button type="button" className="primary" onClick={handleAddExercise}>Add</button>
            <button type="button" onClick={() => setIsAddingExercise(false)}>Cancel</button>
          </td>
        </tr>
      )}
    </tbody>
  );
}

export default LiftSetGroup;
