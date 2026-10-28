// Programs page: lists my programs, creates new ones, and deletes them.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPrograms, createProgram, deleteProgram } from "../api.js";

function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function loadPrograms() {
    setError("");
    try {
      setPrograms(await getPrograms());
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPrograms();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      // Dates are optional; the backend wants null, not an empty string.
      await createProgram({
        name: name,
        start_date: startDate === "" ? null : startDate,
        end_date: endDate === "" ? null : endDate,
      });
      setName("");
      setStartDate("");
      setEndDate("");
      await loadPrograms();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(program) {
    // The backend deletes the program's days, sets and subsets too.
    if (!window.confirm(`Delete "${program.name}" and everything in it?`)) {
      return;
    }
    setError("");
    try {
      await deleteProgram(program.id);
      await loadPrograms();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <p>Loading…</p>;
  }

  return (
    <div>
      <h1>Programs</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="card">
        <h2>New program</h2>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <div className="form-row">
          <label>
            Start date (optional)
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label>
            End date (optional)
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
        </div>
        <button type="submit">Add program</button>
      </form>

      {programs.length === 0 && <p>No programs yet.</p>}
      <ul className="list">
        {programs.map((program) => (
          <li key={program.id}>
            <Link to={`/programs/${program.id}`}>{program.name}</Link>{" "}
            <button type="button" onClick={() => handleDelete(program)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Programs;
