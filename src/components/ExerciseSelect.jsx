// Dropdown of exercises grouped by muscle group.
// Used on the lift pages and the program pages, so it lives here.

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
