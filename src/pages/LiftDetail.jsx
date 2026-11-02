// Lift detail page: shows one lift with its sets, and lets me edit or delete the
// lift, add sets, and apply a program day.
// It can also show a past lift beside it (read-only) for comparison.

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getLift,
  getFriendLift,
  updateLift,
  deleteLift,
  getExercises,
  getMuscleGroups,
} from "../api.js";
import ApplyProgramForm from "../components/ApplyProgramForm.jsx";
import CompareFriendLiftPicker from "../components/CompareFriendLiftPicker.jsx";
import CompareLiftPicker from "../components/CompareLiftPicker.jsx";
import HistoricalLiftPanel from "../components/HistoricalLiftPanel.jsx";
import LiftSetsTable from "../components/LiftSetsTable.jsx";
import SetsSummary from "../components/SetsSummary.jsx";
import { numberOrNull } from "../formHelpers.js";

/** @typedef {import("../types.js").Lift} Lift */
/** @typedef {import("../types.js").FriendLift} FriendLift */
/** @typedef {import("../types.js").PublicProfile} PublicProfile */
/** @typedef {import("../types.js").Exercise} Exercise */
/** @typedef {import("../types.js").MuscleGroup} MuscleGroup */

function LiftDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lift, setLift] = useState(/** @type {Lift | null} */ (null));
  const [exercises, setExercises] = useState(/** @type {Exercise[]} */ ([]));
  const [muscleGroups, setMuscleGroups] = useState(/** @type {MuscleGroup[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fields for the "edit lift" form.
  const [date, setDate] = useState("");
  // "" while blank, otherwise a whole number.
  const [bodyWeight, setBodyWeight] = useState(/** @type {string | number} */ (""));

  // Comparison with a past lift. Both are tagged with the lift they were opened
  // on, so going to a different lift's page starts with no comparison.
  // comparison: { forLiftId, liftId, lift, friend } where lift is null while it loads,
  // and friend is the friend whose lift it is (null for one of my own past lifts).
  const [pickingForLiftId, setPickingForLiftId] = useState(/** @type {string | null} */ (null));
  // Whether the picker open is for a friend's lift or for one of my own.
  const [pickingFriendLift, setPickingFriendLift] = useState(false);
  const [comparison, setComparison] = useState(
    /** @type {{ forLiftId: string, liftId: number, lift: Lift | FriendLift | null, friend: PublicProfile | null } | null} */ (null)
  );
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

  // Opens the picker for one of my own past lifts, or for a friend's lift.
  /** @param {boolean} forFriend */
  function openPicker(forFriend) {
    setPickingFriendLift(forFriend);
    setPickingForLiftId(id);
  }

  // Loads the chosen past lift (mine, or a friend's) into the comparison column.
  // Read-only: this only fetches the lift, it never changes it.
  /**
   * @param {PublicProfile | null} friend  Null for one of my own lifts.
   * @param {number} pastLiftId
   */
  async function loadComparison(friend, pastLiftId) {
    const requestNumber = ++latestComparisonRequest.current;
    setPickingForLiftId(null);
    setComparison({ forLiftId: id, liftId: pastLiftId, lift: null, friend });
    try {
      const pastLift = friend ? await getFriendLift(friend.id, pastLiftId) : await getLift(pastLiftId);
      if (requestNumber === latestComparisonRequest.current) {
        setComparison({ forLiftId: id, liftId: pastLiftId, lift: pastLift, friend });
      }
    } catch (err) {
      if (requestNumber === latestComparisonRequest.current) {
        setComparison(null);
        setError(err.message);
      }
    }
  }

  /** @param {number} pastLiftId */
  function handlePickComparison(pastLiftId) {
    return loadComparison(null, pastLiftId);
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
          <div className="lift-toolbar-actions">
            <button type="button" onClick={() => openPicker(false)}>
              Compare with a past lift
            </button>
            <button type="button" onClick={() => openPicker(true)}>
              Compare with a friend&apos;s lift
            </button>
          </div>
        )}
      </div>
      {error && <p className="error">{error}</p>}

      {isPicking && pickingFriendLift && (
        <CompareFriendLiftPicker
          onPick={loadComparison}
          onCancel={() => setPickingForLiftId(null)}
        />
      )}
      {isPicking && !pickingFriendLift && (
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
            friend={activeComparison.friend}
            onChangeDate={() => openPicker(activeComparison.friend !== null)}
            onRemove={handleRemoveComparison}
          />
        )}

        <section className="lift-current">
          <h1>Lift on {lift.date}</h1>

          <form onSubmit={handleSaveLift} className="card">
            <h4>Edit lift</h4>
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

          <h4>Sets</h4>
          <SetsSummary sets={lift.sets} exercises={exercises} />
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
