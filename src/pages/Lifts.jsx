// Lifts page: lists my lifts (newest first) and lets me log a new one.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLifts, createLift } from "../api.js";
import { numberOrNull, todayAsDateString } from "../formHelpers.js";

/** @typedef {import("../types.js").LiftSummary} LiftSummary */

function Lifts() {
  const [lifts, setLifts] = useState(/** @type {LiftSummary[]} */ ([]));
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
    return <p className="state">Loading…</p>;
  }

  return (
    <div>
      <h1>Lifts</h1>
      {error && <p className="state state--error" role="alert">{error}</p>}

      <form onSubmit={handleSubmit} className="card">
        <h4>Log a lift</h4>
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

      {lifts.length === 0 && <p className="state">No lifts yet. Use Log a lift above to add the first one.</p>}
      {lifts.length > 0 && (
        <div className="table-wrap">
          <table className="data-table data-table--compact">
            <thead>
              <tr>
                <th>Date</th>
                <th className="num">Body weight</th>
              </tr>
            </thead>
            <tbody>
              {lifts.map((lift) => (
                <tr key={lift.id}>
                  <td><Link to={`/lifts/${lift.id}`}>{lift.date}</Link></td>
                  <td className="num">{lift.body_weight ?? "–"}</td>
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
