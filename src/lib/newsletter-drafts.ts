import { SITE } from "@/lib/constants";
import { getNewsletterUnsubscribeUrl } from "@/lib/newsletter";
import { formatNewsletterSourceList } from "@/lib/newsletter-sources";
import {
  emailParagraph,
  escapeHtml,
  renderEmailLayout,
} from "@/lib/email-template";
import { sendEmail } from "@/lib/resend-client";
import type {
  Event,
  NewsletterDraft,
  NewsletterSourceEvent,
} from "@/types/database";

function formatEventDate(date: string | null | undefined) {
  if (!date) return "Date TBA";
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function buildSourceEventFromDbEvent(event: Event): NewsletterSourceEvent {
  return {
    title: event.title,
    venue: event.venue,
    event_date: event.event_date,
    source: "killscomfort.com/events",
    description: event.description,
  };
}

export function buildDraftHtmlFromEvents(events: NewsletterSourceEvent[]) {
  if (events.length === 0) {
    return emailParagraph(
      "No confirmed events this week yet — check back soon or follow along on Instagram for last-minute drops."
    );
  }

  const items = events
    .map((event) => {
      const parts = [
        `<strong>${escapeHtml(event.title)}</strong>`,
        escapeHtml(formatEventDate(event.event_date)),
      ];
      if (event.venue) parts.push(`@ ${escapeHtml(event.venue)}`);
      if (event.description) parts.push(escapeHtml(event.description));
      if (event.ticket_url) {
        parts.push(
          `<a href="${escapeHtml(event.ticket_url)}" style="color:#ffffff;text-decoration:underline;">Tickets / info</a>`
        );
      }
      if (event.source) {
        parts.push(
          `<span style="opacity:0.55;font-size:13px;">via ${escapeHtml(event.source)}</span>`
        );
      }
      return `<li style="margin-bottom:16px;">${parts.join("<br/>")}</li>`;
    })
    .join("");

  return [
    emailParagraph(
      `Here&apos;s what&apos;s happening in Miami this week — pulled from ${escapeHtml(formatNewsletterSourceList())} and the local scene.`
    ),
    `<ul style="margin:0 0 20px;padding-left:18px;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:#ffffff;opacity:0.88;">${items}</ul>`,
    emailParagraph(
      `Want ${escapeHtml(SITE.name)} at your next event? <a href="${SITE.url}/book" style="color:#ffffff;text-decoration:underline;">Book an inquiry</a>.`
    ),
  ].join("");
}

export function defaultDraftSubject(weekLabel?: string) {
  const label =
    weekLabel ||
    new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" });
  return `Miami this week — ${label}`;
}

export function defaultDraftTitle(weekLabel?: string) {
  const label =
    weekLabel ||
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  return `Weekly Miami Events — ${label}`;
}

export async function sendNewsletterDraftToSubscribers(
  draft: Pick<NewsletterDraft, "subject" | "preheader" | "content_html">,
  subscribers: { email: string; unsubscribe_token: string }[]
) {
  let sentCount = 0;
  const failures: string[] = [];

  for (const subscriber of subscribers) {
    const unsubscribeUrl = getNewsletterUnsubscribeUrl(
      subscriber.unsubscribe_token
    );
    const html = renderEmailLayout({
      title: draft.subject,
      preheader: draft.preheader || draft.subject,
      content: `${draft.content_html}${emailParagraph(`<span style="font-size:13px;opacity:0.55;"><a href="${escapeHtml(unsubscribeUrl)}" style="color:#ffffff;text-decoration:underline;">Unsubscribe</a></span>`)}`,
    });

    const result = await sendEmail({
      to: subscriber.email,
      subject: draft.subject,
      html,
    });

    if (result.ok) {
      sentCount += 1;
    } else if (!result.skipped) {
      failures.push(subscriber.email);
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `Sent ${sentCount} of ${subscribers.length}. Failed: ${failures.slice(0, 5).join(", ")}${failures.length > 5 ? "…" : ""}`
    );
  }

  return { sentCount, skipped: subscribers.length === 0 };
}

export async function sendNewsletterDraftReadyNotification(
  draft: Pick<NewsletterDraft, "id" | "title" | "subject">
) {
  const adminUrl = `${SITE.url}/admin/newsletter/drafts`;
  const content = [
    emailParagraph("A new Miami events newsletter draft is ready for your review."),
    emailParagraph(
      `<strong>${escapeHtml(draft.title)}</strong><br/>Subject: ${escapeHtml(draft.subject)}`
    ),
    emailParagraph(
      `<a href="${adminUrl}" style="color:#ffffff;text-decoration:underline;">Open drafts in admin</a> to edit, approve, and send.`
    ),
  ].join("");

  return sendEmail({
    to: process.env.INQUIRY_NOTIFICATION_EMAIL || SITE.email,
    subject: `Newsletter draft ready — ${draft.title}`,
    html: renderEmailLayout({
      title: "Newsletter draft ready",
      preheader: `${draft.title} is waiting for review.`,
      content,
    }),
  });
}
