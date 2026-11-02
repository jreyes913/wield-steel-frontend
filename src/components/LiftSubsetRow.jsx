// One exercise inside a set, shown as a table row on the lift detail page.
// "Edit" turns the cells into inputs in place; Save or Cancel turns them back.

import { useState } from "react";
import { updateLiftSubset, deleteLiftSubset } from "../api.js";
import ExerciseSelect from "./ExerciseSelect.jsx";
import { numberOrNull } from "../formHelpers.js";

/**
 * exercises, muscleGroups, onChanged and onError are only needed when it is editable.
 * @param {object} props
 * @param {import("../types.js").LiftSubset} props.subset
 * @param {import("react").ReactNode} props.leadingCells  The set's checkbox and number
 *   cells (see SetLeadingCells), filled on its first exercise only.
 * @param {boolean} [props.readOnly]  The historical comparison: values only, no Edit or Delete.
 * @param {import("../types.js").Exercise[]} [props.exercises]
 * @param {import("../types.js").MuscleGroup[]} [props.muscleGroups]
 * @param {import("../types.js").OnChanged} [props.onChanged]  Reloads the lift.
 * @param {import("../types.js").OnError} [props.onError]
 */
function LiftSubsetRow({
  subset,
  leadingCells,
  readOnly = false,
  exercises,
  muscleGroups,
  onChanged,
  onError,
}) {
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

  if (readOnly || !isEditing) {
    return (
      <tr>
        {leadingCells}
        <td>{subset.exercise.name}</td>
        <td>{subset.reps ?? "–"}</td>
        <td>{subset.rir ?? "–"}</td>
        <td>{subset.weight ?? "–"}</td>
        {!readOnly && (
          <td className="actions">
            <button type="button" onClick={() => setIsEditing(true)}>Edit</button>
            <button type="button" className="danger" onClick={handleDelete}>Delete</button>
          </td>
        )}
      </tr>
    );
  }

  return (
    <tr>
      {leadingCells}
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
