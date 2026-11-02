// Dropdown of exercises grouped by muscle group.
// Used on the lift pages and the program pages, so it lives here.

/**
 * @param {object} props
 * @param {import("../types.js").Exercise[]} props.exercises
 * @param {import("../types.js").MuscleGroup[]} props.muscleGroups
 * @param {string} props.value  The chosen exercise's id as text, or "" for none.
 * @param {(exerciseId: string) => void} props.onChange
 */
function ExerciseSelect({ exercises, muscleGroups, value, onChange }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} required>
      <option value="">Choose an exercise…</option>
      {muscleGroups.map((muscleGroup) => (
        <optgroup key={muscleGroup.id} label={muscleGroup.name}>
          {exercises
            .filter((exercise) => exercise.muscle_group_id === muscleGroup.id)
            .map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}

export default ExerciseSelect;
