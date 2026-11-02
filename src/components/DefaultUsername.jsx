// Shows nothing. Once after sign-in, swaps an auto-generated username for the email
// handle (see usernameDefault.js).

import { useEffect } from "react";
import { setDefaultUsername } from "../usernameDefault.js";

function DefaultUsername() {
  useEffect(() => {
    setDefaultUsername();
  }, []);
  return null;
}

export default DefaultUsername;
