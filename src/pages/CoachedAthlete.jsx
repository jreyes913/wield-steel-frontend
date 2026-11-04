// An athlete I coach: their name, programs and lifts, read-only. It only ever fetches.
// Body weight shows only when the athlete has allowed it.

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCoachedAthlete, getCoachedLifts, getCoachedPrograms } from "../api.js";
import FriendBanner from "../components/FriendBanner.jsx";
import { coachLoadError, displayName } from "../friendHelpers.js";

/** @typedef {import("../types.js").PublicProfile} PublicProfile */
/** @typedef {import("../types.js").ProgramSummary} ProgramSummary */
/** @typedef {import("../types.js").CoachedLiftSummary} CoachedLiftSummary */

function CoachedAthlete() {
  const { athleteId } = useParams();

  const [athlete, setAthlete] = useState(
    /** @type {(PublicProfile & { can_see_body_weight: boolean }) | null} */ (null)
  );
  const [programs, setPrograms] = useState(/** @type {ProgramSummary[]} */ ([]));
  const [lifts, setLifts] = useState(/** @type {CoachedLiftSummary[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Ignore the answer if the page moved to another athlete before it arrived.
    let isCurrent = true;
    async function load() {
      setLoading(true);
      setError("");
      setAthlete(null);
      try {
        const [loadedAthlete, loadedPrograms, loadedLifts] = await Promise.all([
          getCoachedAthlete(athleteId),
          getCoachedPrograms(athleteId),
          getCoachedLifts(athleteId),
        ]);
        if (isCurrent) {
          setAthlete(loadedAthlete);
          setPrograms(loadedPrograms);
          setLifts(loadedLifts);
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
  }, [athleteId]);

  if (loading) {
    return <p>Loading…</p>;
  }
  // The athlete failed to load (for example a 404), so there is nothing else to show.
  if (!athlete) {
    return (
      <div>
        <p className="error">{error}</p>
        <Link to="/coaching">Back to coaching</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/coaching">← Coaching</Link>
      <h1>{displayName(athlete)}</h1>
      <FriendBanner athlete={athlete} what="training" />
      <p>Username: {athlete.username}</p>

      <div className="friend-cards">
        <section className="card">
          <h4>Programs</h4>
          <p>Only the programs they have made public.</p>
          {programs.length === 0 && <p>No public programs.</p>}
          {programs.length > 0 && (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Start</th>
                    <th>End</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((program) => (
                    <tr key={program.id}>
                      <td>
                        <Link to={`/coaching/${athlete.id}/programs/${program.id}`}>{program.name}</Link>
                      </td>
                      <td>{program.start_date ?? "–"}</td>
                      <td>{program.end_date ?? "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <h4>Lifts</h4>
          {lifts.length === 0 && <p>No lifts yet.</p>}
          {lifts.length > 0 && (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    {athlete.can_see_body_weight && <th>Body weight</th>}
                  </tr>
                </thead>
                <tbody>
                  {lifts.map((lift) => (
                    <tr key={lift.id}>
                      <td><Link to={`/coaching/${athlete.id}/lifts/${lift.id}`}>{lift.date}</Link></td>
                      {athlete.can_see_body_weight && <td>{lift.body_weight ?? "–"}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default CoachedAthlete;
