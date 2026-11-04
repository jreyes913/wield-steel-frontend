// Coaching page: ask someone to let me coach them, answer coaches who asked me, choose
// what each of my coaches can see, and open the athletes I coach. A coach only ever reads
// (programs and lifts, and body weight only if the athlete allows it).

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  answerCoachingRequest,
  cancelCoachingRequest,
  createCoachGroup,
  deleteCoachGroup,
  getCoaching,
  removeCoach,
  sendCoachingRequest,
  setCoachBodyWeight,
  stopCoaching,
  updateCoachGroup,
} from "../api.js";
import GroupFilter from "../components/GroupFilter.jsx";
import { displayName, shortDate } from "../friendHelpers.js";

/** @typedef {import("../types.js").CoachingOverview} CoachingOverview */

function Coaching() {
  const [overview, setOverview] = useState(
    /** @type {CoachingOverview} */ ({ coaches: [], athletes: [], incoming: [], outgoing: [], groups: [] })
  );
  const [username, setUsername] = useState("");
  // The name typed for a new group.
  const [groupName, setGroupName] = useState("");
  // The group the "Athletes I coach" list is filtered to ("" is everyone).
  const [groupFilter, setGroupFilter] = useState("");
  // The athlete whose "Add to group" menu is open.
  const [addingToGroupFor, setAddingToGroupFor] = useState(/** @type {import("../types.js").Id | null} */ (null));
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
  /** @param {() => Promise<unknown>} action  May return a string: the notice to show. */
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

  function handleCreateGroup(event) {
    event.preventDefault();
    run(async () => {
      const group = await createCoachGroup(groupName);
      setGroupName("");
      return `Group "${group.name}" created. Use "Add to group" next to an athlete below.`;
    });
  }

  /**
   * @param {import("../types.js").CoachGroup} group
   * @param {import("../types.js").Id} athleteId
   * @param {boolean} inGroup
   */
  function handleToggleMember(group, athleteId, inGroup) {
    const ids = inGroup
      ? [...group.athlete_ids, Number(athleteId)]
      : group.athlete_ids.filter((id) => id !== Number(athleteId));
    run(() => updateCoachGroup(group.id, { athlete_ids: ids }));
  }

  /**
   * Adds an athlete to the group chosen in their "Add to group" menu.
   * @param {import("../types.js").Id} athleteId
   * @param {string} groupId
   */
  function handleAddToGroup(athleteId, groupId) {
    const group = overview.groups.find((g) => String(g.id) === groupId);
    setAddingToGroupFor(null);
    if (group) {
      handleToggleMember(group, athleteId, true);
    }
  }

  /** @param {import("../types.js").CoachGroup} group */
  function handleDeleteGroup(group) {
    if (!window.confirm(`Delete the group "${group.name}"? Its athletes stay; only the group goes.`)) {
      return;
    }
    run(async () => {
      await deleteCoachGroup(group.id);
      setGroupFilter("");
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
    return <p className="state">Loading…</p>;
  }

  // "Athletes I coach", narrowed to the chosen group.
  const filterGroup = overview.groups.find((g) => String(g.id) === groupFilter);
  const shownAthletes = filterGroup
    ? overview.athletes.filter(({ athlete }) => filterGroup.athlete_ids.includes(Number(athlete.id)))
    : overview.athletes;

  return (
    <div>
      <h1>Coaching</h1>
      {error && <p className="state state--error" role="alert">{error}</p>}
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
        <GroupFilter groups={overview.groups} value={groupFilter} onChange={setGroupFilter} />
        {overview.athletes.length > 0 && shownAthletes.length === 0 && <p className="state">No athletes in this group.</p>}
        {shownAthletes.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Since</th>
                  <th>Groups</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {shownAthletes.map(({ athlete, since }) => {
                  const inGroups = overview.groups.filter((g) => g.athlete_ids.includes(Number(athlete.id)));
                  const otherGroups = overview.groups.filter((g) => !g.athlete_ids.includes(Number(athlete.id)));
                  return (
                    <tr key={athlete.id}>
                      <td><Link to={`/coaching/${athlete.id}`}>{displayName(athlete)}</Link></td>
                      <td>{athlete.username}</td>
                      <td>{since ? shortDate(since) : ""}</td>
                      <td>
                        {inGroups.length === 0 && "–"}
                        {inGroups.map((group) => (
                          <span key={group.id}>
                            {group.name}{" "}
                            <button
                              type="button"
                              aria-label={`Take ${displayName(athlete)} out of ${group.name}`}
                              onClick={() => handleToggleMember(group, athlete.id, false)}
                            >
                              ×
                            </button>{" "}
                          </span>
                        ))}
                      </td>
                      <td className="actions">
                        {addingToGroupFor === athlete.id ? (
                          <select
                            aria-label={`Add ${displayName(athlete)} to a group`}
                            value=""
                            autoFocus
                            onChange={(e) => handleAddToGroup(athlete.id, e.target.value)}
                            onBlur={() => setAddingToGroupFor(null)}
                          >
                            <option value="">Choose a group…</option>
                            {otherGroups.map((group) => (
                              <option key={group.id} value={String(group.id)}>{group.name}</option>
                            ))}
                          </select>
                        ) : (
                          <button
                            type="button"
                            disabled={otherGroups.length === 0}
                            title={
                              overview.groups.length === 0
                                ? "Create a group first"
                                : otherGroups.length === 0
                                  ? "Already in every group"
                                  : ""
                            }
                            onClick={() => setAddingToGroupFor(athlete.id)}
                          >
                            Add to group
                          </button>
                        )}
                        <button type="button" className="danger" onClick={() => handleStop(athlete)}>
                          Stop coaching
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h4>Groups</h4>
        <p>
          Create and delete groups here. Put athletes in them with "Add to group" next to an athlete below,
          and filter by group when you stop coaching or send a program. Only you can see your groups; athletes never do.
        </p>
        <form onSubmit={handleCreateGroup} className="inline-form">
          <input
            aria-label="New group name"
            placeholder="New group name"
            maxLength={40}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
          <button type="submit">Create group</button>
        </form>
        {overview.groups.length === 0 && <p className="state">No groups yet.</p>}
        {overview.groups.map((group) => (
          <div key={group.id} className="card">
            <div className="inline-form">
              <strong>{group.name}</strong>
              <span>
                {group.athlete_ids.length} athlete{group.athlete_ids.length === 1 ? "" : "s"}
              </span>
              <button type="button" className="danger" onClick={() => handleDeleteGroup(group)}>Delete</button>
            </div>
          </div>
        ))}
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
