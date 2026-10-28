// Line chart of body weight over time, for the Progress page.

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { getBodyWeightProgress } from "../api.js";
import "../chartSetup.js";

function BodyWeightChart() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPoints() {
    setError("");
    try {
      const loadedPoints = await getBodyWeightProgress();
      // Lifts logged without a body weight come back as null; there is nothing to plot.
      setPoints(loadedPoints.filter((point) => point.body_weight !== null));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPoints();
  }, []);

  if (loading) {
    return <p>Loading…</p>;
  }

  const chartData = {
    labels: points.map((point) => point.date),
    datasets: [
      {
        label: "Body weight",
        data: points.map((point) => point.body_weight),
      },
    ],
  };

  return (
    <div className="chart">
      <h2>Body weight</h2>
      {error && <p className="error">{error}</p>}
      {points.length === 0 ? <p>No body weight logged yet.</p> : <Line data={chartData} />}
    </div>
  );
}

export default BodyWeightChart;
