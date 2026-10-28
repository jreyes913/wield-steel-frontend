// Lifts page: lists my lifts (newest first) and lets me log a new one.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLifts, createLift } from "../api.js";
import { numberOrNull, todayAsDateString } from "../formHelpers.js";

function Lifts() {
  const [lifts, setLifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [date, setDate] = useState(todayAsDateString());
  const [bodyWeight, setBodyWeight] = useState("");

  async function loadLifts() {
    setError("");
    try {
      // The backend already returns them newest first.
      setLifts(await getLifts());
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadLifts();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      await createLift({ date: date, body_weight: numberOrNull(bodyWeight) });
      setDate(todayAsDateString());
      setBodyWeight("");
      await loadLifts();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <p>Loading…</p>;
  }

  return (
    <div>
      <h1>Lifts</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="card">
        <h2>Log a lift</h2>
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          Body weight (whole number, optional)
          <input
            type="number"
            step="1"
            value={bodyWeight}
            onChange={(e) => setBodyWeight(e.target.value)}
          />
        </label>
        <button type="submit">Add lift</button>
      </form>

      {lifts.length === 0 && <p>No lifts yet.</p>}
      {lifts.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Body weight</th>
              </tr>
            </thead>
            <tbody>
              {lifts.map((lift) => (
                <tr key={lift.id}>
                  <td><Link to={`/lifts/${lift.id}`}>{lift.date}</Link></td>
                  <td>{lift.body_weight ?? "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Lifts;
