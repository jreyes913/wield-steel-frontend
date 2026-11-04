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
import SendProgram from "../components/SendProgram.jsx";

/** @typedef {import("../types.js").Program} Program */
/** @typedef {import("../types.js").Exercise} Exercise */
/** @typedef {import("../types.js").MuscleGroup} MuscleGroup */

function ProgramDetail() {
  const { id } = useParams();

  const [program, setProgram] = useState(/** @type {Program | null} */ (null));
  const [exercises, setExercises] = useState(/** @type {Exercise[]} */ ([]));
  const [muscleGroups, setMuscleGroups] = useState(/** @type {MuscleGroup[]} */ ([]));
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

  async function handleSetPublic(isPublic) {
    setError("");
    try {
      await updateProgram(id, { is_public: isPublic });
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

  // A program a coach sent: shown exactly as the coach has it right now, and never editable.
  if (program.synced) {
    return (
      <div>
        <Link to="/programs">← All programs</Link>
        <h1>{program.name}</h1>
        {error && <p className="error">{error}</p>}
        <p className="friend-banner">
          From {program.assigned_by_name ?? "a former coach"} · kept in sync · read-only · private
        </p>
        <p>
          {program.start_date ?? "–"} to {program.end_date ?? "–"}
        </p>
        <p>
          This program changes when your coach changes it. Only you can see it. You can use its
          days when you log a lift, or delete it from your list. If you stop being coached, you
          keep the program as it was.
        </p>
        <h4>Days</h4>
        {program.days.length === 0 && <p>No days yet.</p>}
        {program.days.map((day) => (
          <ProgramDayCard key={day.id} day={day} exercises={exercises} readOnly />
        ))}
      </div>
    );
  }

  // Once a coach's program stops syncing the athlete keeps it, but it stays private for good.
  const fromCoach = program.assigned_by != null;

  return (
    <div>
      <Link to="/programs">← All programs</Link>
      <h1>{program.name}</h1>
      {error && <p className="error">{error}</p>}

      {fromCoach && (
        <p className="friend-banner">Sent by a coach · no longer kept in sync · private</p>
      )}
      {!fromCoach && (
      <section className="card">
        <h4>Who can see this program</h4>
        <label>
          <input
            type="checkbox"
            checked={Boolean(program.is_public)}
            onChange={(e) => handleSetPublic(e.target.checked)}
          />{" "}
          Public: my friends and my coaches can see it
        </label>
        <p>
          {program.is_public
            ? "Friends and coaches can open this program, and friends can copy it."
            : "Private: only you can see it."}
        </p>
      </section>
      )}

      {!fromCoach && <SendProgram programId={program.id} />}

      <form onSubmit={handleSaveProgram} className="card">
        <h4>Edit program</h4>
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

      <h4>Days</h4>
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
        <h4>Add a day</h4>
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
