// Privacy Policy. Public: no sign-in needed. It describes only what the app does today.

import LegalPage from "../components/LegalPage.jsx";

/** The Privacy Policy page (draft until a lawyer has reviewed it). */
function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <h2>What we store</h2>
      <ul>
        <li>Your sign-in: your email address and a password (held by AWS Cognito, not by us in plain text).</li>
        <li>Your profile: username, first and last name, date of birth, gender and height, all optional except the username.</li>
        <li>Your training: lifts you log (date, body weight, sets, reps, RIR and weights) and the programs you build.</li>
        <li>Your friendships: who you have sent requests to, who sent requests to you, who you are friends with, and who you have blocked.</li>
        <li>
          Technical records: our server logs each request&apos;s time, the kind of request, the
          result and your account number, never what you sent. We also count recent attempts
          on a few actions to stop abuse.
        </li>
        <li>Your browser keeps your sign-in tokens so you stay signed in.</li>
      </ul>
      <p>We do not use advertising or analytics trackers, and we do not sell your data.</p>

      <h2>Who can see it</h2>
      <ul>
        <li>Only you can see your body weight, date of birth, gender, height and progress charts.</li>
        <li>
          Your accepted friends can see your username, your name, your programs and your logged
          lifts (sets, reps, RIR and weights) but never your body weight or profile details. You
          can hide your lifts from a particular friend.
        </li>
        <li>People who are not your friends cannot see your data. Someone you have blocked cannot find you by username.</li>
        <li>
          Exercises you add to the shared exercise list can be seen by all users, and are not
          removed when you delete your account.
        </li>
        <li>Our hosting provider (Amazon Web Services) stores and processes the data for us.</li>
      </ul>

      <h2>Download or delete your data</h2>
      <p>
        On the Profile page, &quot;Download my data&quot; saves everything stored about you as a
        file, and &quot;Delete my account&quot; permanently deletes your profile, lifts,
        programs, friendships and sign-in. Friends then simply stop seeing you. Database backups
        may keep copies for a limited time after deletion [retention period to be confirmed].
      </p>

      <h2>Contact</h2>
      <p>Questions about your data: [support email address to be decided].</p>
    </LegalPage>
  );
}

export default Privacy;
