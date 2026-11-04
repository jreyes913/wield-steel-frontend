// A lift of an athlete I coach: its date and sets, read-only. It only ever fetches.

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCoachedAthlete, getCoachedLift, getExercises } from "../api.js";
import FriendBanner from "../components/FriendBanner.jsx";
import LiftSetsTable from "../components/LiftSetsTable.jsx";
import SetsSummary from "../components/SetsSummary.jsx";
import { coachLoadError, displayName } from "../friendHelpers.js";

/** @typedef {import("../types.js").PublicProfile} PublicProfile */
/** @typedef {import("../types.js").CoachedLift} CoachedLift */
/** @typedef {import("../types.js").Exercise} Exercise */

function CoachedLift() {
  const { athleteId, liftId } = useParams();

  const [athlete, setAthlete] = useState(/** @type {PublicProfile | null} */ (null));
  const [lift, setLift] = useState(/** @type {CoachedLift | null} */ (null));
  const [exercises, setExercises] = useState(/** @type {Exercise[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Ignore the answer if the page moved to another lift before it arrived.
    let isCurrent = true;
    async function load() {
      setLoading(true);
      setError("");
      setLift(null);
      try {
        const [loadedAthlete, loadedLift, loadedExercises] = await Promise.all([
          getCoachedAthlete(athleteId),
          getCoachedLift(athleteId, liftId),
          getExercises(),
        ]);
        if (isCurrent) {
          setAthlete(loadedAthlete);
          setLift(loadedLift);
          setExercises(loadedExercises);
        }
      } catch (err) {
        if (isCurrent) {
          setError(coachLoadError(err));
        }
      }
      if (isCurrent) {
        setLoading(false);
      }
    }
    load();
    return () => {
      isCurrent = false;
    };
  }, [athleteId, liftId]);

  if (loading) {
    return <p className="state">Loading…</p>;
  }
  if (!athlete || !lift) {
    return (
      <div>
        <p className="state state--error" role="alert">{error}</p>
        <Link className="back-link" to="/coaching">Back to coaching</Link>
      </div>
    );
  }

  return (
    <div>
      <Link className="back-link" to={`/coaching/${athlete.id}`}>← {displayName(athlete)}</Link>
      <FriendBanner athlete={athlete} what="lift" />
      <h1>Lift on {lift.date}</h1>
      {lift.body_weight != null && <p>Body weight: {lift.body_weight}</p>}

      <h4>Sets</h4>
      <SetsSummary sets={lift.sets} exercises={exercises} />
      <LiftSetsTable lift={lift} readOnly />
    </div>
  );
}

export default CoachedLift;
