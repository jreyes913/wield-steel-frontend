// Footer with links to the legal pages. Shown on every page, signed in or not.

import { Link } from "react-router-dom";

/** Links to the Privacy Policy and Terms of Service. */
function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link to="/privacy">Privacy Policy</Link>
      <Link to="/terms">Terms of Service</Link>
    </footer>
  );
}

export default SiteFooter;
