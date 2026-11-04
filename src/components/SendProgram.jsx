// "Send to my athletes": tick any of the athletes I coach and put a copy of this program into
// each of their programs in one go. They don't need to accept; they see it marked as from me,
// and can delete it. Nothing is shown to someone who coaches nobody.

import { useEffect, useState } from "react";
import { getCoaching, sendProgram } from "../api.js";
import { displayName } from "../friendHelpers.js";

/** @typedef {import("../types.js").CoachLink} CoachLink */
/** @typedef {import("../types.js").Id} Id */

/**
 * @param {object} props
 * @param {number} props.programId  The program to send.
 */
function SendProgram({ programId }) {
  const [athletes, setAthletes] = useState(/** @type {CoachLink[]} */ ([]));
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

  function toggleAll() {
    setSelected(selected.size === athletes.length ? new Set() : new Set(athletes.map((a) => a.athlete.id)));
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
        results.map((r) => `${byId.get(r.athlete_id) ?? r.athlete_id}: ${r.ok ? "sent" : r.error}`)
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
        Puts a copy in each chosen athlete&apos;s programs, marked as from you. It works even if
        this program is private, and later edits here do not change their copy.
      </p>
      {error && <p className="error">{error}</p>}
      <p>
        <label>
          <input
            type="checkbox"
            checked={selected.size === athletes.length}
            onChange={toggleAll}
          />{" "}
          Select all ({athletes.length})
        </label>
      </p>
      {athletes.map(({ athlete }) => (
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
      {outcome.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </section>
  );
}

export default SendProgram;
