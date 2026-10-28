// Program detail page: edit a program's name and dates, and manage its days.
// Sets and exercises inside each day are handled by the day card components.

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getProgram,
  updateProgram,
  createProgramDay,
  getExercises,
  getMuscleGroups,
} from "../api.js";
import ProgramDayCard from "../components/ProgramDayCard.jsx";

function ProgramDetail() {
  const { id } = useParams();

  const [program, setProgram] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fields for the "edit program" form.
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Field for the "add day" form.
  const [newDayName, setNewDayName] = useState("");

  // Child components call this after every successful change.
  async function loadProgram() {
    setError("");
    try {
      const loadedProgram = await getProgram(id);
      setProgram(loadedProgram);
      setName(loadedProgram.name);
      setStartDate(loadedProgram.start_date ?? "");
      setEndDate(loadedProgram.end_date ?? "");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  // Exercises and muscle groups never change while on this page, so load them once.
  async function loadExercises() {
    try {
      setExercises(await getExercises());
      setMuscleGroups(await getMuscleGroups());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadProgram();
    loadExercises();
    // Reload if the URL changes to a different program.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSaveProgram(event) {
    event.preventDefault();
    try {
      await updateProgram(id, {
        name: name,
        start_date: startDate === "" ? null : startDate,
        end_date: endDate === "" ? null : endDate,
      });
      await loadProgram();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddDay(event) {
    event.preventDefault();
    try {
      await createProgramDay(id, newDayName);
      setNewDayName("");
      await loadProgram();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <p>Loading…</p>;
  }
  // The program failed to load (for example a 404), so there is nothing else to show.
  if (!program) {
    return (
      <div>
        <p className="error">{error}</p>
        <Link to="/programs">Back to programs</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/programs">← All programs</Link>
      <h1>{program.name}</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSaveProgram} className="card">
        <h2>Edit program</h2>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Start date (optional)
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End date (optional)
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <button type="submit">Save</button>
      </form>

      <h2>Days</h2>
      {program.days.length === 0 && <p>No days yet.</p>}
      {program.days.map((day) => (
        <ProgramDayCard
          key={day.id}
          day={day}
          exercises={exercises}
          muscleGroups={muscleGroups}
          onChanged={loadProgram}
          onError={setError}
        />
      ))}

      <form onSubmit={handleAddDay} className="card">
        <h2>Add a day</h2>
        <label>
          Day name
          <input value={newDayName} onChange={(e) => setNewDayName(e.target.value)} required />
        </label>
        <button type="submit">Add day</button>
      </form>
    </div>
  );
}

export default ProgramDetail;
