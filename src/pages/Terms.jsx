// Terms of Service. Public: no sign-in needed. Placeholder terms until a lawyer reviews them.

import LegalPage from "../components/LegalPage.jsx";

/** The Terms of Service page (draft until a lawyer has reviewed it). */
function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="2026-11-05">
      <h2>The service</h2>
      <p>
        This is a workout tracker: you log lifts, follow progress, build programs and share them
        with friends and coaches. Accounts are currently by invitation.
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

      <h2>Coaches and athletes</h2>
      <ul>
        <li>
          Anyone can ask to coach another user, and nobody is a coach of yours unless you accept.
          A coach can only read what you allow; they cannot change your data.
        </li>
        <li>
          Coaches are other users, not us. We do not check their qualifications, we do not
          endorse them, and we are not responsible for what they say or advise outside the app.
        </li>
        <li>
          If you coach someone, use what you see only to coach them. Do not copy, share or
          publish their data, and stop if they end the arrangement.
        </li>
        <li>
          A coach can send programs to the athletes they coach. Only send programs you have the
          right to share, and do not use sending to spam or pressure anyone. Athletes can delete
          what they receive or remove the coach.
        </li>
        <li>We may end a coaching link or an account that is used to harass people or to misuse their data.</li>
        <li>[Rules for users under 18 to be decided before they can be coached.]</li>
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
