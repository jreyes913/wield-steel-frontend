// Profile page: shows the signed-in user's profile and lets them edit it.

import { useEffect, useState } from "react";
import { signOut } from "aws-amplify/auth";
import { deleteMyAccount, exportMyData, getMe, updateMe } from "../api.js";

// The choices in the Gender dropdown. These exact words are what gets saved.
const GENDERS = ["Male", "Female"];

// The backend wants whole numbers or null, never empty strings.
function emptyToNull(text) {
  return text === "" ? null : text;
}

function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  // The delete-account section: what was typed to confirm, and whether it is running.
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [username, setUsername] = useState("");
  // The username as saved, so only a changed one is sent.
  const [savedUsername, setSavedUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  // "" while blank, otherwise a whole number.
  const [height, setHeight] = useState(/** @type {string | number} */ (""));

  // Fetch the profile and copy it into the form fields.
  // Null values become "" because controlled inputs can't hold null.
  async function loadProfile() {
    setLoading(true);
    setError("");
    try {
      const profile = await getMe();
      setUsername(profile.username ?? "");
      setSavedUsername(profile.username ?? "");
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
      setDateOfBirth(profile.dob ?? "");
      // Match ignoring case, so an older "male" shows as "Male". Anything else shows as blank.
      setGender(GENDERS.find((g) => g.toLowerCase() === profile.gender?.toLowerCase()) ?? "");
      setHeight(profile.height ?? "");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  // Saves everything the backend holds about me as a JSON file.
  async function handleDownload() {
    setError("");
    try {
      const data = await exportMyData();
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "my-workout-data.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  }

  // Deletes the account, then signs out here. The sign-in is already gone on the server,
  // so a sign-out error doesn't matter. Nothing calls the API after this.
  async function handleDelete(event) {
    event.preventDefault();
    setError("");
    setDeleting(true);
    try {
      await deleteMyAccount(confirmText.trim());
    } catch (err) {
      setError(err.message);
      setDeleting(false);
      return;
    }
    try {
      await signOut();
    } catch {
      // Ignored on purpose; see above.
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaved(false);
    try {
      await updateMe({
        // Only sent when changed. The backend lowercases it and says if it is taken.
        ...(username.trim() !== savedUsername ? { username: username.trim() } : {}),
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
    return <p className="state">Loading…</p>;
  }

  return (
    <div>
      <h1>Profile</h1>
      {error && <p className="state state--error" role="alert">{error}</p>}
      {saved && <p className="success">Saved.</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            maxLength={30}
            pattern="[A-Za-z0-9._\-]+"
            title="3 to 30 letters, numbers, dots, underscores or hyphens"
            required
          />
        </label>
        <p>Friends add you by this. It starts as your email name and must be unique.</p>
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
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Choose…</option>
            {GENDERS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
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

      <h2>Your data</h2>
      <p>Download everything stored about you: profile, lifts, programs, friends and blocked names.</p>
      <button type="button" onClick={handleDownload}>Download my data</button>

      <h2>Delete my account</h2>
      <p>
        This permanently deletes your profile, lifts, programs and friendships, and your sign-in.
        Friends simply stop seeing you. It cannot be undone, so download your data first.
      </p>
      <form onSubmit={handleDelete}>
        <label>
          Type your username ({savedUsername}) to confirm
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
          />
        </label>
        <button
          type="submit"
          className="danger"
          disabled={deleting || confirmText.trim().toLowerCase() !== savedUsername.toLowerCase()}
        >
          {deleting ? "Deleting…" : "Delete my account"}
        </button>
      </form>
    </div>
  );
}

export default Profile;
