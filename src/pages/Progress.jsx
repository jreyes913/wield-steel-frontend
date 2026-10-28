// Progress page: a body weight chart and a strength chart for one exercise.
// Each chart loads its own data; this page only loads the exercise list they share.

import { useEffect, useState } from "react";
import { getExercises, getMuscleGroups } from "../api.js";
import BodyWeightChart from "../components/BodyWeightChart.jsx";
import StrengthChart from "../components/StrengthChart.jsx";

function Progress() {
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
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
      <h1>Progress</h1>
      {error && <p className="error">{error}</p>}
      <BodyWeightChart />
      <StrengthChart exercises={exercises} muscleGroups={muscleGroups} />
    </div>
  );
}

export default Progress;
