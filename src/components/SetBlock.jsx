// One block of sets (see blocks.js): a header bar with the block's letter, its
// exercises and how many sets it has, above the block's own table (passed as children).
// A collapsible block's header is a button that hides or shows the table.

import { useState } from "react";

// forceOpen keeps the table showing while something inside it needs to be seen,
// such as the "add exercise" row the toolbar just opened.
function SetBlock({ block, collapsible, forceOpen = false, children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isOpen = !collapsible || !isCollapsed || forceOpen;

  const exerciseNames =
    block.sets[0].subsets.map((subset) => subset.exercise.name).join(" + ") || "No exercises";
  const setCount = `${block.sets.length} ${block.sets.length === 1 ? "set" : "sets"}`;
  const title = (
    <>
      <span className="block-label">Block {block.label}</span>
      <span className="block-summary">{exerciseNames} · {setCount}</span>
    </>
  );

  return (
    <section className={isOpen ? "block" : "block block--collapsed"}>
      {collapsible ? (
        <button
          type="button"
          className="block-header"
          aria-expanded={isOpen}
          onClick={() => setIsCollapsed(isOpen)}
        >
          <span className="block-toggle" aria-hidden="true">{isOpen ? "▾" : "▸"}</span>
          {title}
        </button>
      ) : (
        <div className="block-header">{title}</div>
      )}
      {isOpen && <div className="table-wrap">{children}</div>}
    </section>
  );
}

export default SetBlock;
