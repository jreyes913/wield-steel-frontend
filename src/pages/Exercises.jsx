// Exercises page: every exercise with its Difficulty and Complexity, one table per
// muscle group. Read-only; exercise data is entered in the database.

import { useEffect, useState } from "react";
import { getExercises, getMuscleGroups } from "../api.js";
import { COMPLEXITY, DIFFICULTY } from "../glossary.js";
import { MAX_DIFFICULTY } from "../exerciseInfo.js";

/** @typedef {import("../types.js").Exercise} Exercise */
/** @typedef {import("../types.js").MuscleGroup} MuscleGroup */

function Exercises() {
  const [exercises, setExercises] = useState(/** @type {Exercise[]} */ ([]));
  const [muscleGroups, setMuscleGroups] = useState(/** @type {MuscleGroup[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadExercises() {
    setError("");
    try {
      setExercises(await getExercises());
      setMuscleGroups(await getMuscleGroups());
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadExercises();
  }, []);

  if (loading) {
    return <p>Loading…</p>;
  }

  return (
    <div>
      <h1>Exercises</h1>
      {error && <p className="error">{error}</p>}

      <dl className="card glossary">
        {[DIFFICULTY, COMPLEXITY].map(({ term, meaning }) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{meaning}</dd>
          </div>
        ))}
      </dl>

      {exercises.length === 0 && !error && <p>No exercises yet.</p>}
      {muscleGroups.map((muscleGroup) => {
        // The backend already sends exercises sorted by name.
        const groupExercises = exercises.filter(
          (exercise) => exercise.muscle_group_id === muscleGroup.id
        );
        if (groupExercises.length === 0) {
          return null;
        }
        return (
          <section key={muscleGroup.id}>
            <h4>{muscleGroup.name}</h4>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Exercise</th>
                    <th>Difficulty</th>
                    <th>Complexity</th>
                  </tr>
                </thead>
                <tbody>
                  {groupExercises.map((exercise) => (
                    <tr key={exercise.id}>
                      <td>{exercise.name}</td>
                      <td>
                        {exercise.difficulty === null || exercise.difficulty === undefined
                          ? "–"
                          : `${exercise.difficulty}/${MAX_DIFFICULTY}`}
                      </td>
                      <td>{exercise.complexity || "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default Exercises;
