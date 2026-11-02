// The "New set" box at the bottom of a sets table: a header bar, then the form row
// (passed as children, a <table> holding AddLiftSetFooter or AddProgramSetFooter).

/** @param {{ children: import("react").ReactNode }} props */
function NewSetBlock({ children }) {
  return (
    <section className="block">
      <div className="block-header">
        <span className="block-label">New set</span>
      </div>
      <div className="table-wrap">{children}</div>
    </section>
  );
}

export default NewSetBlock;
