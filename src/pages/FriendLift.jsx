// A friend's lift: its date and sets, read-only. No body weight, no comparison, no
// way to apply a program. It only ever fetches.

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getExercises, getFriend, getFriendLift } from "../api.js";
import FriendBanner from "../components/FriendBanner.jsx";
import LiftSetsTable from "../components/LiftSetsTable.jsx";
import SetsSummary from "../components/SetsSummary.jsx";
import { displayName, friendLoadError } from "../friendHelpers.js";

/** @typedef {import("../types.js").PublicProfile} PublicProfile */
/** @typedef {import("../types.js").FriendLift} FriendLift */
/** @typedef {import("../types.js").Exercise} Exercise */

function FriendLiftPage() {
  const { athleteId, liftId } = useParams();

  const [friend, setFriend] = useState(/** @type {PublicProfile | null} */ (null));
  const [lift, setLift] = useState(/** @type {FriendLift | null} */ (null));
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
        const [loadedFriend, loadedLift, loadedExercises] = await Promise.all([
          getFriend(athleteId),
          getFriendLift(athleteId, liftId),
          getExercises(),
        ]);
        if (isCurrent) {
          setFriend(loadedFriend);
          setLift(loadedLift);
          setExercises(loadedExercises);
        }
      } catch (err) {
        if (isCurrent) {
          setError(friendLoadError(err));
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
    return <p>Loading…</p>;
  }
  // The lift failed to load (for example a 404), so there is nothing else to show.
  if (!friend || !lift) {
    return (
      <div>
        <p className="error">{error}</p>
        <Link to="/friends">Back to friends</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to={`/friends/${friend.id}`}>← {displayName(friend)}</Link>
      <FriendBanner athlete={friend} what="lift" />
      <h1>Lift on {lift.date}</h1>

      <h4>Sets</h4>
      <SetsSummary sets={lift.sets} exercises={exercises} />
      <LiftSetsTable lift={lift} readOnly />
    </div>
  );
}

export default FriendLiftPage;
