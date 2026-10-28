// Form on the lift detail page: pick a program, then one of its days, and apply it
// to this lift.

import { useEffect, useState } from "react";
import { getPrograms, getProgram, applyProgramDay } from "../api.js";

function ApplyProgramForm({ liftId, onChanged, onError }) {
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  // Days only come with the full program (GET /programs/{id}), so we fetch them
  // once a program is picked.
  const [days, setDays] = useState([]);
  const [selectedDayId, setSelectedDayId] = useState("");

  useEffect(() => {
    async function loadPrograms() {
      try {
        setPrograms(await getPrograms());
      } catch (err) {
        onError(err.message);
      }
    }
    loadPrograms();
    // onError is a new function every render; we only want to load once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleProgramChange(programId) {
    setSelectedProgramId(programId);
    setSelectedDayId("");
    setDays([]);
    if (programId === "") {
      return;
    }
    try {
      const program = await getProgram(programId);
      setDays(program.days);
    } catch (err) {
      onError(err.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await applyProgramDay(liftId, Number(selectedDayId));
      setSelectedProgramId("");
      setSelectedDayId("");
      setDays([]);
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>Apply a program day</h2>
      <label>
        Program
        <select
          value={selectedProgramId}
          onChange={(e) => handleProgramChange(e.target.value)}
          required
        >
          <option value="">Choose a program…</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>{program.name}</option>
          ))}
        </select>
      </label>
      <label>
        Day
        <select value={selectedDayId} onChange={(e) => setSelectedDayId(e.target.value)} required>
          <option value="">Choose a day…</option>
          {days.map((day) => (
            <option key={day.id} value={day.id}>{day.name}</option>
          ))}
        </select>
      </label>
      <button type="submit">Apply</button>
    </form>
  );
}

export default ApplyProgramForm;
