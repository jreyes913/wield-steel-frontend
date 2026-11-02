// A friend's page: their name and username, with their programs and their lifts
// listed side by side. Read-only: it only ever fetches.

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { blockAthlete, getFriend, getFriendLifts, getFriendPrograms } from "../api.js";
import FriendBanner from "../components/FriendBanner.jsx";
import { displayName, friendLoadError } from "../friendHelpers.js";

/** @typedef {import("../types.js").PublicProfile} PublicProfile */
/** @typedef {import("../types.js").ProgramSummary} ProgramSummary */
/** @typedef {import("../types.js").FriendLiftSummary} FriendLiftSummary */

function FriendDetail() {
  const { athleteId } = useParams();
  const navigate = useNavigate();

  const [friend, setFriend] = useState(/** @type {PublicProfile | null} */ (null));
  const [programs, setPrograms] = useState(/** @type {ProgramSummary[]} */ ([]));
  const [lifts, setLifts] = useState(/** @type {FriendLiftSummary[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Ignore the answer if the page moved to another friend before it arrived.
    let isCurrent = true;
    async function load() {
      setLoading(true);
      setError("");
      setFriend(null);
      try {
        const [loadedFriend, loadedPrograms, loadedLifts] = await Promise.all([
          getFriend(athleteId),
          getFriendPrograms(athleteId),
          getFriendLifts(athleteId),
        ]);
        if (isCurrent) {
          setFriend(loadedFriend);
          setPrograms(loadedPrograms);
          setLifts(loadedLifts);
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
  }, [athleteId]);

  // Blocks this friend (which also ends the friendship), then goes back to the list.
  async function handleBlock() {
    const message =
      `Block ${displayName(friend)}? They are removed from your friends, ` +
      "and can't send you another request.";
    if (!window.confirm(message)) {
      return;
    }
    try {
      await blockAthlete(athleteId);
      navigate("/friends");
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <p>Loading…</p>;
  }
  // The friend failed to load (for example a 404), so there is nothing else to show.
  if (!friend) {
    return (
      <div>
        <p className="error">{error}</p>
        <Link to="/friends">Back to friends</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/friends">← All friends</Link>
      <h1>{displayName(friend)}</h1>
      <FriendBanner athlete={friend} what="profile" />
      {error && <p className="error">{error}</p>}
      <p>Username: {friend.username}</p>
      <p>
        <button type="button" className="danger" onClick={handleBlock}>Block</button>
      </p>

      <div className="friend-cards">
        <section className="card">
          <h4>Programs</h4>
          {programs.length === 0 && <p>No programs yet.</p>}
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
                        <Link to={`/friends/${friend.id}/programs/${program.id}`}>{program.name}</Link>
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
                  </tr>
                </thead>
                <tbody>
                  {lifts.map((lift) => (
                    <tr key={lift.id}>
                      <td><Link to={`/friends/${friend.id}/lifts/${lift.id}`}>{lift.date}</Link></td>
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

export default FriendDetail;
