// Terms of Service. Public: no sign-in needed. Placeholder terms until a lawyer reviews them.

import LegalPage from "../components/LegalPage.jsx";

/** The Terms of Service page (draft until a lawyer has reviewed it). */
function Terms() {
  return (
    <LegalPage title="Terms of Service">
      <h2>The service</h2>
      <p>
        This is a workout tracker: you log lifts, follow progress, build programs and share them
        with friends. Accounts are currently by invitation.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Keep your password private. You are responsible for what happens under your account.</li>
        <li>Choose a username that is not misleading or offensive. We may remove usernames that are.</li>
        <li>You can delete your account at any time from the Profile page.</li>
      </ul>

      <h2>What you may do</h2>
      <ul>
        <li>Use the app for your own training and to share with people who agree to be your friends.</li>
        <li>Do not send friend requests in bulk, probe for other people&apos;s usernames, or try to break or overload the service.</li>
        <li>Do not add misleading or offensive entries to the shared exercise list.</li>
      </ul>

      <h2>Not medical advice</h2>
      <p>
        The app records and charts your training. It does not give medical or coaching advice.
        Lifting carries a risk of injury: train within your limits and talk to a professional if
        you are unsure.
      </p>

      <h2>Availability</h2>
      <p>
        We try to keep the service running and your data safe, but it is provided as is, may
        change or be unavailable, and we do not guarantee it. Download your data from the
        Profile page if you want your own copy.
      </p>

      <h2>Changes and contact</h2>
      <p>
        We may update these terms and will say so in the app. Questions: [support email address
        to be decided]. Governing law and liability wording: [to be added after legal review].
      </p>
    </LegalPage>
  );
}

export default Terms;
