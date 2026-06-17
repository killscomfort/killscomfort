import Link from "next/link";
import { NewsletterUnsubscribeForm } from "@/components/forms/NewsletterUnsubscribeForm";
import { getNewsletterSubscriberByToken } from "@/lib/newsletter";
import { SITE } from "@/lib/constants";

export default async function NewsletterUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  const subscriber = token ? await getNewsletterSubscriberByToken(token) : null;

  return (
    <section className="min-h-[70vh] bg-near-black grain-overlay">
      <div className="mx-auto max-w-7xl section-padding">
        <p className="mb-10 text-center text-xs uppercase tracking-[0.3em] text-muted-gold">
          {SITE.name} Newsletter
        </p>

        {!token || !subscriber ? (
          <div className="mx-auto max-w-lg text-center">
            <p className="text-2xl text-bone sm:text-3xl">Invalid unsubscribe link</p>
            <p className="mt-4 text-sm leading-relaxed text-bone/65 sm:text-base">
              Use the unsubscribe link from your welcome email, or contact us at{" "}
              <a
                href={`mailto:${SITE.email}`}
                className="text-bone underline hover:text-muted-gold"
              >
                {SITE.email}
              </a>
              .
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="text-sm uppercase tracking-widest text-muted-gold hover:text-bone"
              >
                Back to home
              </Link>
            </div>
          </div>
        ) : (
          <NewsletterUnsubscribeForm
            token={token}
            email={subscriber.email}
            alreadyUnsubscribed={Boolean(subscriber.unsubscribed_at)}
          />
        )}
      </div>
    </section>
  );
}
