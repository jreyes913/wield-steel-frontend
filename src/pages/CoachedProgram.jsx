// A program of an athlete I coach: its name, dates and days, read-only. It only ever fetches.

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCoachedAthlete, getCoachedProgram, getExercises } from "../api.js";
import FriendBanner from "../components/FriendBanner.jsx";
import ProgramDayCard from "../components/ProgramDayCard.jsx";
import { coachLoadError, displayName } from "../friendHelpers.js";

/** @typedef {import("../types.js").PublicProfile} PublicProfile */
/** @typedef {import("../types.js").Program} Program */
/** @typedef {import("../types.js").Exercise} Exercise */

function CoachedProgram() {
  const { athleteId, programId } = useParams();

  const [athlete, setAthlete] = useState(/** @type {PublicProfile | null} */ (null));
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
        const [loadedAthlete, loadedProgram, loadedExercises] = await Promise.all([
          getCoachedAthlete(athleteId),
          getCoachedProgram(athleteId, programId),
          getExercises(),
        ]);
        if (isCurrent) {
          setAthlete(loadedAthlete);
          setProgram(loadedProgram);
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
  }, [athleteId, programId]);

  if (loading) {
    return <p className="state">Loading…</p>;
  }
  if (!athlete || !program) {
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
      <FriendBanner athlete={athlete} what="program" />
      <h1>{program.name}</h1>
      <p>
        {program.start_date ?? "–"} to {program.end_date ?? "–"}
      </p>

      <h4>Days</h4>
      {program.days.length === 0 && <p className="state">No days yet.</p>}
      {program.days.map((day) => (
        <ProgramDayCard key={day.id} day={day} exercises={exercises} readOnly />
      ))}
    </div>
  );
}

export default CoachedProgram;
