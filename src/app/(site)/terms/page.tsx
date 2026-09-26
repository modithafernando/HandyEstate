export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl px-5 pt-8 sm:px-8 [&_h2]:mt-8 [&_h2]:text-lead [&_h2]:font-bold [&_p]:mt-3 [&_p]:text-body [&_p]:text-ink-2">
      <h1 className="text-title font-extrabold">Terms</h1>
      <p>HandyEstate helps you find and contact local service providers. It is free during the beta.</p>
      <h2>Agreements are between you and the provider</h2>
      <p>HandyEstate doesn’t take bookings or payments. The job, the price and the timing are agreed directly between you and the provider. Prices on profiles are a guide.</p>
      <h2>Verification</h2>
      <p>“Verified” means we checked the provider’s NIC. It is not a guarantee of their work. Read reviews and agree the price before work starts.</p>
      <h2>Reviews and reports</h2>
      <p>Reviews must be honest and about real work. We may hide reviews or profiles that break these rules. Use “Report this profile” if something is wrong.</p>
    </article>
  );
}
