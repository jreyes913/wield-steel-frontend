// "Send to my athletes": tick any of the athletes I coach and put a copy of this program into
// each of their programs in one go. They don't need to accept; they see it marked as from me,
// and can delete it. Nothing is shown to someone who coaches nobody.

import { useEffect, useState } from "react";
import { getCoaching, sendProgram } from "../api.js";
import { displayName } from "../friendHelpers.js";
import GroupFilter from "./GroupFilter.jsx";

/** @typedef {import("../types.js").CoachLink} CoachLink */
/** @typedef {import("../types.js").Id} Id */

/**
 * @param {object} props
 * @param {number} props.programId  The program to send.
 */
function SendProgram({ programId }) {
  const [athletes, setAthletes] = useState(/** @type {CoachLink[]} */ ([]));
  const [groups, setGroups] = useState(/** @type {import("../types.js").CoachGroup[]} */ ([]));
  // The group shown in the filter ("" is everyone). Ticks are kept when the filter changes.
  const [groupId, setGroupId] = useState("");
  const [selected, setSelected] = useState(/** @type {Set<Id>} */ (new Set()));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState(/** @type {string[]} */ ([]));

  useEffect(() => {
    let isCurrent = true;
    getCoaching()
      .then((overview) => {
        if (isCurrent) {
          setAthletes(overview.athletes);
          setGroups(overview.groups);
        }
      })
      .catch((err) => {
        if (isCurrent) {
          setError(err.message);
        }
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  /** @param {Id} id */
  function toggle(id) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  }

  // The athletes the filter shows.
  const group = groups.find((g) => String(g.id) === groupId);
  const visible = group ? athletes.filter((a) => group.athlete_ids.includes(Number(a.athlete.id))) : athletes;
  const allVisibleSelected = visible.length > 0 && visible.every((a) => selected.has(a.athlete.id));

  // Ticks every athlete the filter shows, or clears them when they are all ticked already.
  function toggleAll() {
    const next = new Set(selected);
    for (const a of visible) {
      if (allVisibleSelected) {
        next.delete(a.athlete.id);
      } else {
        next.add(a.athlete.id);
      }
    }
    setSelected(next);
  }

  async function handleSend() {
    setError("");
    setOutcome([]);
    setSending(true);
    try {
      const { results } = await sendProgram(programId, [...selected]);
      /** @type {Map<Id, string>} */
      const byId = new Map(athletes.map((a) => [a.athlete.id, displayName(a.athlete)]));
      setOutcome(
        results.map(
          (r) =>
            `${byId.get(r.athlete_id) ?? r.athlete_id}: ${r.ok ? (r.already_sent ? "already had it" : "sent") : r.error}`
        )
      );
      setSelected(new Set(results.filter((r) => !r.ok).map((r) => r.athlete_id)));
    } catch (err) {
      setError(err.message);
    }
    setSending(false);
  }

  if (athletes.length === 0) {
    return null;
  }

  return (
    <section className="card">
      <h4>Send to my athletes</h4>
      <p>
        Gives each chosen athlete this program, marked as from you. They can&apos;t change it, it
        stays private to them, and it is kept in sync: when you add or delete a day, set or
        exercise here, they see it too. It works even if this program is private. If you delete
        this program or stop coaching them, they keep the program as it was.
      </p>
      {error && <p className="error">{error}</p>}
      <GroupFilter groups={groups} value={groupId} onChange={setGroupId} />
      <p>
        <label>
          <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} />{" "}
          Select all ({visible.length})
        </label>
      </p>
      {visible.length === 0 && <p>No athletes in this group.</p>}
      {visible.map(({ athlete }) => (
        <div key={athlete.id}>
          <label>
            <input type="checkbox" checked={selected.has(athlete.id)} onChange={() => toggle(athlete.id)} />{" "}
            {displayName(athlete)} ({athlete.username})
          </label>
        </div>
      ))}
      <p>
        <button type="button" className="primary" disabled={selected.size === 0 || sending} onClick={handleSend}>
          {sending ? "Sending…" : `Send to ${selected.size} athlete${selected.size === 1 ? "" : "s"}`}
        </button>
      </p>
      {selected.size > visible.filter((a) => selected.has(a.athlete.id)).length && (
        <p>Some of the athletes you ticked are hidden by the group filter; they will still get it.</p>
      )}
      {outcome.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </section>
  );
}

export default SendProgram;
