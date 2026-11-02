// Shared layout for the legal pages. They open without signing in, so nothing here
// calls the API.

import { Link } from "react-router-dom";
import SiteFooter from "./SiteFooter.jsx";

/**
 * @param {{ title: string, children: import("react").ReactNode }} props
 *   title is the page heading; children are the sections.
 */
function LegalPage({ title, children }) {
  return (
    <div className="app">
      <main className="page legal">
        <p><Link to="/">Back to the app</Link></p>
        <p className="error">Draft: have a lawyer review before launch.</p>
        <h1>{title}</h1>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export default LegalPage;
