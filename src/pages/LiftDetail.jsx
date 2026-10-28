// Lift detail page: shows one lift with its sets, and lets me edit or delete the
// lift, add sets, and apply a program day.

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getLift, updateLift, deleteLift, getExercises, getMuscleGroups } from "../api.js";
import AddLiftSetFooter from "../components/AddLiftSetFooter.jsx";
import ApplyProgramForm from "../components/ApplyProgramForm.jsx";
import LiftSetGroup from "../components/LiftSetGroup.jsx";
import { numberOrNull, nextPosition } from "../formHelpers.js";

function LiftDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lift, setLift] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fields for the "edit lift" form.
  const [date, setDate] = useState("");
  const [bodyWeight, setBodyWeight] = useState("");

  // Child components call this after every successful change.
  async function loadLift() {
    setError("");
    try {
      const loadedLift = await getLift(id);
      setLift(loadedLift);
      setDate(loadedLift.date);
      setBodyWeight(loadedLift.body_weight ?? "");
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
    loadLift();
    loadExercises();
    // Reload if the URL changes to a different lift.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSaveLift(event) {
    event.preventDefault();
    try {
      await updateLift(id, { date: date, body_weight: numberOrNull(String(bodyWeight)) });
      await loadLift();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteLift() {
    // The backend deletes all the lift's sets and subsets too.
    if (!window.confirm("Delete this lift and all of its sets?")) {
      return;
    }
    try {
      await deleteLift(id);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <p>Loading…</p>;
  }
  // The lift failed to load (for example a 404), so there is nothing else to show.
  if (!lift) {
    return (
      <div>
        <p className="error">{error}</p>
        <Link to="/">Back to lifts</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/">← All lifts</Link>
      <h1>Lift on {lift.date}</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSaveLift} className="card">
        <h2>Edit lift</h2>
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
        <button type="submit">Save</button>{" "}
        <button type="button" onClick={handleDeleteLift}>Delete lift</button>
      </form>

      <h2>Sets</h2>
      {lift.sets.length === 0 && <p>No sets yet. Add the first one in the last row.</p>}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Reps</th>
              <th>RIR</th>
              <th>Weight</th>
              <th></th>
            </tr>
          </thead>
          {/* Each set is its own <tbody>, so its rows stay visually grouped. */}
          {lift.sets.map((set) => (
            <LiftSetGroup
              key={set.id}
              set={set}
              liftId={lift.id}
              nextSetPosition={nextPosition(lift.sets)}
              exercises={exercises}
              muscleGroups={muscleGroups}
              onChanged={loadLift}
              onError={setError}
            />
          ))}
          <AddLiftSetFooter
            liftId={lift.id}
            position={nextPosition(lift.sets)}
            exercises={exercises}
            muscleGroups={muscleGroups}
            onChanged={loadLift}
            onError={setError}
          />
        </table>
      </div>

      <ApplyProgramForm liftId={lift.id} onChanged={loadLift} onError={setError} />
    </div>
  );
}

export default LiftDetail;
