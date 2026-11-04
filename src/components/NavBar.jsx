// Navigation bar shown on every page once the user is signed in.

import { NavLink } from "react-router-dom";
import { useFriendRequests } from "../friendRequests.js";

/** @param {{ signOut?: () => void }} props  signOut comes from the Authenticator in App.jsx. */
function NavBar({ signOut }) {
  const { count } = useFriendRequests();

  return (
    <nav className="navbar">
      {/* Training pages first: what is used every session. */}
      <div className="navbar-group navbar-group--main">
        {/* "end" makes "/" highlight only on the exact home page, not on every page. */}
        <NavLink to="/" end>Lifts</NavLink>
        <NavLink to="/programs">Programs</NavLink>
        <NavLink to="/progress">Progress</NavLink>
        <NavLink to="/exercises">Exercises</NavLink>
      </div>
      {/* People, then the account. On a phone these two groups share the second row. */}
      <div className="navbar-secondary">
        <div className="navbar-group navbar-group--people">
          {/* The count is of requests waiting for me; nothing shows when there are none. */}
          <NavLink to="/friends">{count > 0 ? `Friends (${count})` : "Friends"}</NavLink>
          <NavLink to="/coaching">Coaching</NavLink>
        </div>
        <div className="navbar-group navbar-group--account">
          <NavLink to="/profile">Profile</NavLink>
          <NavLink to="/get-started">Get Started</NavLink>
          <button type="button" className="navbar-signout" onClick={signOut}>Sign out</button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
