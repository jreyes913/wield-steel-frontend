// Lift detail page: shows one lift with its sets, and lets me edit or delete the
// lift, add sets, and apply a program day.
// It can also show a past lift beside it (read-only) for comparison.

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getLift, updateLift, deleteLift, getExercises, getMuscleGroups } from "../api.js";
import ApplyProgramForm from "../components/ApplyProgramForm.jsx";
import CompareLiftPicker from "../components/CompareLiftPicker.jsx";
import HistoricalLiftPanel from "../components/HistoricalLiftPanel.jsx";
import LiftSetsTable from "../components/LiftSetsTable.jsx";
import { numberOrNull } from "../formHelpers.js";

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

  // Comparison with a past lift. Both are tagged with the lift they were opened
  // on, so going to a different lift's page starts with no comparison.
  // comparison: { forLiftId, lift } where lift is null while it loads.
  const [pickingForLiftId, setPickingForLiftId] = useState(null);
  const [comparison, setComparison] = useState(null);
  // Counts comparison requests, so a slow response for an older pick is ignored.
  const latestComparisonRequest = useRef(0);
  const isPicking = pickingForLiftId === id;
  const activeComparison = comparison?.forLiftId === id ? comparison : null;

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

  // Loads the chosen past lift into the comparison column. Read-only: this only
  // fetches the lift, it never changes it.
  async function handlePickComparison(pastLiftId) {
    const requestNumber = ++latestComparisonRequest.current;
    setPickingForLiftId(null);
    setComparison({ forLiftId: id, liftId: pastLiftId, lift: null });
    try {
      const pastLift = await getLift(pastLiftId);
      if (requestNumber === latestComparisonRequest.current) {
        setComparison({ forLiftId: id, liftId: pastLiftId, lift: pastLift });
      }
    } catch (err) {
      if (requestNumber === latestComparisonRequest.current) {
        setComparison(null);
        setError(err.message);
      }
    }
  }

  // Back to the single-column page. Only the comparison state is cleared, so any
  // edits in progress on the current lift stay as they were.
  function handleRemoveComparison() {
    latestComparisonRequest.current++;
    setComparison(null);
    setPickingForLiftId(null);
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
      <div className="lift-toolbar">
        <Link to="/">← All lifts</Link>
        {!isPicking && !activeComparison && (
          <button type="button" onClick={() => setPickingForLiftId(id)}>
            Compare with a past lift
          </button>
        )}
      </div>
      {error && <p className="error">{error}</p>}

      {isPicking && (
        <CompareLiftPicker
          currentLift={lift}
          selectedLiftId={activeComparison?.liftId}
          onPick={handlePickComparison}
          onCancel={() => setPickingForLiftId(null)}
          onError={setError}
        />
      )}

      {/* The current lift always stays in the same place in this tree, so opening
          or closing the comparison never resets what is being typed into it. */}
      <div className={activeComparison ? "lift-layout lift-layout--comparing" : "lift-layout"}>
        {activeComparison && (
          <HistoricalLiftPanel
            lift={activeComparison.lift}
            onChangeDate={() => setPickingForLiftId(id)}
            onRemove={handleRemoveComparison}
          />
        )}

        <section className="lift-current">
          <h1>Lift on {lift.date}</h1>

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
          <LiftSetsTable
            lift={lift}
            exercises={exercises}
            muscleGroups={muscleGroups}
            onChanged={loadLift}
            onError={setError}
          />

          <ApplyProgramForm liftId={lift.id} onChanged={loadLift} onError={setError} />
        </section>
      </div>
    </div>
  );
}

export default LiftDetail;
