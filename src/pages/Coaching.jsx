// Coaching page: ask someone to let me coach them, answer coaches who asked me, choose
// what each of my coaches can see, and open the athletes I coach. A coach only ever reads
// (programs and lifts, and body weight only if the athlete allows it).

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  answerCoachingRequest,
  cancelCoachingRequest,
  getCoaching,
  removeCoach,
  sendCoachingRequest,
  setCoachBodyWeight,
  stopCoaching,
} from "../api.js";
import { displayName, shortDate } from "../friendHelpers.js";

/** @typedef {import("../types.js").CoachingOverview} CoachingOverview */

function Coaching() {
  const [overview, setOverview] = useState(
    /** @type {CoachingOverview} */ ({ coaches: [], athletes: [], incoming: [], outgoing: [] })
  );
  const [username, setUsername] = useState("");
  // Per incoming request: whether to also share body weight when accepting.
  const [shareWeight, setShareWeight] = useState(/** @type {Record<number, boolean>} */ ({}));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      setOverview(await getCoaching());
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Runs one action, then reloads so the page shows what the backend now holds.
  /** @param {() => Promise<string | void>} action  May return the notice to show. */
  async function run(action) {
    setError("");
    setNotice("");
    try {
      const message = await action();
      if (typeof message === "string") {
        setNotice(message);
      }
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleAsk(event) {
    event.preventDefault();
    run(async () => {
      await sendCoachingRequest(username);
      setUsername("");
      return "Request sent. They have to accept it.";
    });
  }

  /** @param {import("../types.js").PublicProfile} coach */
  function handleRemoveCoach(coach) {
    if (!window.confirm(`Remove ${displayName(coach)} as your coach? They can no longer see your data.`)) {
      return;
    }
    run(() => removeCoach(coach.id));
  }

  /** @param {import("../types.js").PublicProfile} athlete */
  function handleStop(athlete) {
    if (!window.confirm(`Stop coaching ${displayName(athlete)}?`)) {
      return;
    }
    run(() => stopCoaching(athlete.id));
  }

  if (loading) {
    return <p>Loading…</p>;
  }

  return (
    <div>
      <h1>Coaching</h1>
      {error && <p className="error">{error}</p>}
      {notice && <p className="success">{notice}</p>}
      <p>
        A coach can read your programs and lifts, and nothing else. They can&apos;t change anything,
        and never see your date of birth, gender or height. Body weight is shared only if you allow
        it, and you can end coaching or stop sharing at any time.
      </p>

      <form onSubmit={handleAsk} className="card">
        <h4>Coach someone</h4>
        <div className="inline-form">
          <input
            aria-label="Athlete's username"
            placeholder="Their username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button type="submit">Ask</button>
        </div>
      </form>

      {overview.incoming.length > 0 && (
        <section className="card">
          <h4>Coaches asking to see your training</h4>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Sent</th>
                  <th>Share body weight</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {overview.incoming.map(({ athlete, sent_at }) => (
                  <tr key={athlete.id}>
                    <td>{displayName(athlete)}</td>
                    <td>{athlete.username}</td>
                    <td>{sent_at ? shortDate(sent_at) : ""}</td>
                    <td className="select-cell">
                      <input
                        type="checkbox"
                        aria-label={`Share my body weight with ${displayName(athlete)}`}
                        checked={Boolean(shareWeight[athlete.id])}
                        onChange={(e) => setShareWeight({ ...shareWeight, [athlete.id]: e.target.checked })}
                      />
                    </td>
                    <td className="actions">
                      <button
                        type="button"
                        className="primary"
                        onClick={() =>
                          run(() => answerCoachingRequest(athlete.id, "accepted", Boolean(shareWeight[athlete.id])))
                        }
                      >
                        Accept
                      </button>
                      <button type="button" onClick={() => run(() => answerCoachingRequest(athlete.id, "declined"))}>
                        Decline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="card">
        <h4>My coaches</h4>
        {overview.coaches.length === 0 && <p>Nobody coaches you.</p>}
        {overview.coaches.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Since</th>
                  <th>Can see my body weight</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {overview.coaches.map(({ athlete, since, can_see_body_weight }) => (
                  <tr key={athlete.id}>
                    <td>{displayName(athlete)}</td>
                    <td>{athlete.username}</td>
                    <td>{since ? shortDate(since) : ""}</td>
                    <td className="select-cell">
                      <input
                        type="checkbox"
                        aria-label={`Let ${displayName(athlete)} see my body weight`}
                        checked={can_see_body_weight}
                        onChange={(e) => run(() => setCoachBodyWeight(athlete.id, e.target.checked))}
                      />
                    </td>
                    <td className="actions">
                      <button type="button" className="danger" onClick={() => handleRemoveCoach(athlete)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h4>Athletes I coach</h4>
        {overview.athletes.length === 0 && <p>You don&apos;t coach anyone yet.</p>}
        {overview.athletes.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Since</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {overview.athletes.map(({ athlete, since }) => (
                  <tr key={athlete.id}>
                    <td><Link to={`/coaching/${athlete.id}`}>{displayName(athlete)}</Link></td>
                    <td>{athlete.username}</td>
                    <td>{since ? shortDate(since) : ""}</td>
                    <td className="actions">
                      <button type="button" className="danger" onClick={() => handleStop(athlete)}>
                        Stop coaching
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {overview.outgoing.length > 0 && (
        <section className="card">
          <h4>Requests I sent</h4>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Sent</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {overview.outgoing.map(({ athlete, sent_at }) => (
                  <tr key={athlete.id}>
                    <td>{displayName(athlete)}</td>
                    <td>{athlete.username}</td>
                    <td>{sent_at ? shortDate(sent_at) : ""}</td>
                    <td className="actions">
                      <button type="button" onClick={() => run(() => cancelCoachingRequest(athlete.id))}>
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default Coaching;
