// Profile page: shows the signed-in user's profile and lets them edit it.

import { useEffect, useState } from "react";
import { getMe, updateMe } from "../api.js";

// The backend wants whole numbers or null, never empty strings.
function emptyToNull(text) {
  return text === "" ? null : text;
}

function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");

  // Fetch the profile and copy it into the form fields.
  // Null values become "" because controlled inputs can't hold null.
  async function loadProfile() {
    setLoading(true);
    setError("");
    try {
      const profile = await getMe();
      setUsername(profile.username ?? "");
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
      setDateOfBirth(profile.dob ?? "");
      setGender(profile.gender ?? "");
      setHeight(profile.height ?? "");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaved(false);
    try {
      await updateMe({
        first_name: emptyToNull(firstName),
        last_name: emptyToNull(lastName),
        dob: emptyToNull(dateOfBirth),
        gender: emptyToNull(gender),
        height: height === "" ? null : Number(height),
      });
      // Reload so the form shows exactly what the backend stored.
      await loadProfile();
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <p>Loading…</p>;
  }

  return (
    <div>
      <h1>Profile</h1>
      {error && <p className="error">{error}</p>}
      {saved && <p className="success">Saved.</p>}

      <p>Username: {username}</p>

      <form onSubmit={handleSubmit}>
        <label>
          First name
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </label>
        <label>
          Last name
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </label>
        <label>
          Date of birth
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </label>
        <label>
          Gender
          <input value={gender} onChange={(e) => setGender(e.target.value)} />
        </label>
        <label>
          Height (whole number)
          <input
            type="number"
            step="1"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default Profile;
