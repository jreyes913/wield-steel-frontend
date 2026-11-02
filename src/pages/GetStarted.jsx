// Get Started page: how to use the app, then what the lifting terms and chart
// metrics mean. It is plain text with no data to load, so it has no loading or
// error state. The wording lives in glossary.js.

import { METRIC_HELP, TERMS } from "../glossary.js";

// Metric name (as in the Strength chart's dropdown) -> its glossary key.
const METRICS = [
  ["Weight", "weight"],
  ["Estimated 1RM (per set)", "e1rm"],
  ["Daily 1RM", "daily_1rm"],
  ["Intensity", "intensity"],
  ["Load", "load"],
  ["Volume", "volume"],
];

function GetStarted() {
  return (
    <div>
      <h1>Get Started</h1>

      <section className="card">
        <h4>Log a workout</h4>
        <ol className="steps">
          <li>On <strong>Lifts</strong>, pick the date, add your body weight if you want, and press Add lift. Open the new date.</li>
          <li>In the <strong>New set</strong> row, choose an exercise and enter reps, RIR and weight. Press Add set. Every field except the exercise can stay blank.</li>
          <li>Tick a set, then press <strong>+ Add exercise to this set</strong> to make a superset.</li>
          <li>Tick sets to <strong>Copy</strong> or <strong>Delete</strong> them. The box in a block's header ticks the whole block.</li>
          <li>Press <strong>Edit</strong> on an exercise row to change it. Click a block's header to hide or show it.</li>
        </ol>
      </section>

      <section className="card">
        <h4>Plan with programs</h4>
        <ol className="steps">
          <li>On <strong>Programs</strong>, create a program, then add days such as Leg day.</li>
          <li>Add sets to a day with exercises and reps. Programs have no weight or RIR.</li>
          <li>On a lift, use <strong>Apply a program day</strong> to copy that day's sets in, then fill in RIR and weight as you train.</li>
        </ol>
      </section>

      <section className="card">
        <h4>Compare and track</h4>
        <ol className="steps">
          <li>On a lift, press <strong>Compare with a past lift</strong> and pick a highlighted date. The past lift appears beside this one, read-only.</li>
          <li>On <strong>Progress</strong>, the Body weight chart plots every lift that has a body weight. For Strength, choose an exercise, a metric and optionally a date range.</li>
        </ol>
      </section>

      <section className="card">
        <h4>Lifting terms</h4>
        <dl className="glossary">
          {TERMS.map(({ term, meaning }) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{meaning}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card">
        <h4>Strength metrics</h4>
        <p>
          Charted per exercise. A set needs weight and reps to appear. A 1RM needs RIR 0–5;
          intensity and load also need an RIR and a 1RM from that day.
        </p>
        <dl className="glossary">
          {METRICS.map(([label, key]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>{METRIC_HELP[key]}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export default GetStarted;
