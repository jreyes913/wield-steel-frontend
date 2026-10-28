// Navigation bar shown on every page once the user is signed in.

import { NavLink } from "react-router-dom";

// signOut comes from the Authenticator in App.jsx.
function NavBar({ signOut }) {
  return (
    <nav className="navbar">
      {/* "end" makes "/" highlight only on the exact home page, not on every page. */}
      <NavLink to="/" end>Lifts</NavLink>
      <NavLink to="/progress">Progress</NavLink>
      <NavLink to="/programs">Programs</NavLink>
      <NavLink to="/profile">Profile</NavLink>
      <button type="button" onClick={signOut}>Sign out</button>
    </nav>
  );
}

export default NavBar;
