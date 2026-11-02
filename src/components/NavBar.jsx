// Navigation bar shown on every page once the user is signed in.

import { NavLink } from "react-router-dom";
import { useFriendRequests } from "../friendRequests.js";

/** @param {{ signOut?: () => void }} props  signOut comes from the Authenticator in App.jsx. */
function NavBar({ signOut }) {
  const { count } = useFriendRequests();

  return (
    <nav className="navbar">
      {/* "end" makes "/" highlight only on the exact home page, not on every page. */}
      <NavLink to="/" end>Lifts</NavLink>
      <NavLink to="/progress">Progress</NavLink>
      <NavLink to="/programs">Programs</NavLink>
      <NavLink to="/exercises">Exercises</NavLink>
      {/* The count is of requests waiting for me; nothing shows when there are none. */}
      <NavLink to="/friends">{count > 0 ? `Friends (${count})` : "Friends"}</NavLink>
      <NavLink to="/profile">Profile</NavLink>
      <NavLink to="/get-started">Get Started</NavLink>
      <button type="button" onClick={signOut}>Sign out</button>
    </nav>
  );
}

export default NavBar;
