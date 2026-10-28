// Line chart of one exercise's strength metric over time, for the Progress page.

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { getStrengthProgress } from "../api.js";
import ExerciseSelect from "./ExerciseSelect.jsx";
import "../chartSetup.js";

// Metric name (what the backend calls it) -> text shown in the dropdown.
const METRIC_LABELS = {
  weight: "Weight",
  e1rm: "Estimated 1RM (per set)",
  intensity: "Intensity",
  load: "Load",
  volume: "Volume",
  daily_1rm: "Daily 1RM",
};

function StrengthChart({ exercises, muscleGroups }) {
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("daily_1rm");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [strength, setStrength] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reload whenever the exercise or date range changes. Changing the metric needs no
  // reload, because the response already holds every metric.
  useEffect(() => {
    async function loadStrength() {
      if (selectedExerciseId === "") {
        setStrength(null);
        return;
      }
      setLoading(true);
      setError("");
      try {
        setStrength(await getStrengthProgress(selectedExerciseId, startDate, endDate));
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    loadStrength();
  }, [selectedExerciseId, startDate, endDate]);

  // Works out which points to plot for the chosen metric.
  // daily_1rm is the only metric that is one value per day, so it comes from `days`.
  // All the others are per set, so they come from `sets`.
  function buildPoints() {
    if (selectedMetric === "daily_1rm") {
      return strength.days.map((day) => ({ label: day.date, value: day.daily_1rm }));
    }
    return strength.sets.map((set) => ({
      label: `${set.date} (set ${set.set_position})`,
      value: set[selectedMetric],
    }));
  }

  function renderChart() {
    if (loading) {
      return <p>Loading…</p>;
    }
    if (!strength) {
      return <p>Choose an exercise to see its progress.</p>;
    }
    // A metric is null when no set that day qualified; skip those points.
    const points = buildPoints().filter((point) => point.value !== null);
    if (points.length === 0) {
      return <p>No data for this metric yet.</p>;
    }
    const chartData = {
      labels: points.map((point) => point.label),
      datasets: [
        {
          label: `${strength.exercise.name}: ${METRIC_LABELS[selectedMetric]}`,
          data: points.map((point) => point.value),
        },
      ],
    };
    return <Line data={chartData} />;
  }

  return (
    <div className="chart">
      <h2>Strength</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={(event) => event.preventDefault()}>
        <label>
          Exercise
          <ExerciseSelect
            exercises={exercises}
            muscleGroups={muscleGroups}
            value={selectedExerciseId}
            onChange={setSelectedExerciseId}
          />
        </label>
        <label>
          Metric
          <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
            {Object.entries(METRIC_LABELS).map(([metric, label]) => (
              <option key={metric} value={metric}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          Start date (optional)
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End date (optional)
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </form>

      {renderChart()}
    </div>
  );
}

export default StrengthChart;
