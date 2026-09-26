export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-5 pt-8 sm:px-8 [&_h2]:mt-8 [&_h2]:text-lead [&_h2]:font-bold [&_p]:mt-3 [&_p]:text-body [&_p]:text-ink-2">
      <h1 className="text-title font-extrabold">Privacy</h1>
      <p>This is a short, plain summary for the HandyEstate beta.</p>
      <h2>If you’re looking for help</h2>
      <p>You don’t need an account to search or call. We keep a random ID in a cookie so we can count visits, and we remember the town you choose. We record which profiles are viewed and when someone taps Call or WhatsApp, to understand how HandyEstate is used. We never sell this.</p>
      <p>If you write a review we check your phone number by SMS. Your review shows your first name only.</p>
      <h2>If you’re a service provider</h2>
      <p>Your name, photo, work photos, town, services, prices and reviews are public. Your phone number is given to people who tap Call or WhatsApp on your profile.</p>
      <p>Your NIC is used only to verify you. We store the number in a scrambled form plus the last four digits. The photo of your NIC is visible only to HandyEstate staff and is deleted once it has been checked. Your NIC is never shown to customers.</p>
      <h2>Location</h2>
      <p>If you tap “Use my location”, your browser shares an approximate position once. We use it to pick the nearest town and keep only the town.</p>
      <h2>Questions or removal</h2>
      <p>Contact us to see or delete your data.</p>
    </article>
  );
}
