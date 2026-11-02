// A friend's program: its name, dates and days, read-only. It only ever fetches.

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { copyFriendProgram, getExercises, getFriend, getFriendProgram } from "../api.js";
import FriendBanner from "../components/FriendBanner.jsx";
import ProgramDayCard from "../components/ProgramDayCard.jsx";
import { displayName, friendLoadError } from "../friendHelpers.js";

/** @typedef {import("../types.js").PublicProfile} PublicProfile */
/** @typedef {import("../types.js").Program} Program */
/** @typedef {import("../types.js").Exercise} Exercise */

function FriendProgram() {
  const { athleteId, programId } = useParams();
  const navigate = useNavigate();

  const [friend, setFriend] = useState(/** @type {PublicProfile | null} */ (null));
  const [program, setProgram] = useState(/** @type {Program | null} */ (null));
  const [exercises, setExercises] = useState(/** @type {Exercise[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Ignore the answer if the page moved to another program before it arrived.
    let isCurrent = true;
    async function load() {
      setLoading(true);
      setError("");
      setProgram(null);
      try {
        const [loadedFriend, loadedProgram, loadedExercises] = await Promise.all([
          getFriend(athleteId),
          getFriendProgram(athleteId, programId),
          getExercises(),
        ]);
        if (isCurrent) {
          setFriend(loadedFriend);
          setProgram(loadedProgram);
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
  }, [athleteId, programId]);

  // Makes my own independent copy, then opens it. The friend's program is not touched.
  async function handleCopy() {
    setError("");
    try {
      const copy = await copyFriendProgram(athleteId, programId);
      navigate(`/programs/${copy.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <p>Loading…</p>;
  }
  // The program failed to load (for example a 404), so there is nothing else to show.
  if (!friend || !program) {
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
      <FriendBanner athlete={friend} what="program" />
      <h1>{program.name}</h1>
      {error && <p className="error">{error}</p>}
      <p>
        {program.start_date ?? "–"} to {program.end_date ?? "–"}
      </p>
      <p>
        <button type="button" onClick={handleCopy}>Copy to my programs</button>
      </p>

      <h4>Days</h4>
      {program.days.length === 0 && <p>No days yet.</p>}
      {program.days.map((day) => (
        <ProgramDayCard key={day.id} day={day} exercises={exercises} readOnly />
      ))}
    </div>
  );
}

export default FriendProgram;
