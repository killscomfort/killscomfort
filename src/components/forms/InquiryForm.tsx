"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CONTACT_METHODS, SITE } from "@/lib/constants";
import { trackGenerateLead } from "@/lib/analytics";

interface InquiryFormProps {
  simplified?: boolean;
  source?: string;
  bookingPage?: boolean;
}

export function InquiryForm({
  simplified = false,
  source = "website",
  bookingPage = false,
}: InquiryFormProps) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    const form = new FormData(e.currentTarget);
    const data = {
      simplified,
      name: form.get("name") as string,
      email: form.get("email") as string,
      phone: (form.get("phone") as string) || undefined,
      preferred_contact: form.get("preferred_contact") as string,
      event_date: (form.get("event_date") as string) || undefined,
      message: (form.get("message") as string) || undefined,
      source,
      utm_source: searchParams.get("utm_source") || undefined,
      utm_medium: searchParams.get("utm_medium") || undefined,
      utm_campaign: searchParams.get("utm_campaign") || undefined,
    };

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.errors) {
          setFieldErrors(result.errors);
        } else {
          setError(result.message || "Something went wrong. Try again.");
        }
        return;
      }

      trackGenerateLead({
        source: data.source,
        utm_source: data.utm_source,
        utm_medium: data.utm_medium,
        utm_campaign: data.utm_campaign,
      });

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    if (bookingPage) {
      return (
        <div className="py-12 text-center">
          <p className="mb-4 text-2xl text-bone">Inquiry received ✦</p>
          <p className="mx-auto max-w-md text-sm text-bone/60">
            I&apos;ll get back to you within 24 hours with availability and a custom
            quote. Check your email (and spam folder) for a response from{" "}
            {SITE.email}.
          </p>
        </div>
      );
    }

    return (
      <div className="border border-moss-green/40 bg-moss-green/10 p-8 text-center">
        <h3 className="text-display text-2xl uppercase text-bone">Message Received</h3>
        <p className="mt-4 text-bone/70">
          Thanks for reaching out. Gregory reviews every inquiry personally and
          will respond within 24 hours. Check your email for a confirmation.
        </p>
      </div>
    );
  }

  return (
    <form method="POST" onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="border border-dried-blood/50 bg-dried-blood/10 px-4 py-3 text-sm text-dried-blood">
          {error}
        </p>
      )}

      <div className={simplified ? "space-y-6" : "grid gap-6 sm:grid-cols-2"}>
        <Input
          name="name"
          label="Name *"
          required
          placeholder="Your name"
          error={fieldErrors.name}
        />
        <Input
          name="email"
          type="email"
          label="Email *"
          required
          placeholder="you@email.com"
          error={fieldErrors.email}
        />
      </div>

      <div className={simplified ? "space-y-6" : "grid gap-6 sm:grid-cols-2"}>
        <Select
          name="preferred_contact"
          label="Preferred Contact Method *"
          options={CONTACT_METHODS}
          required
          error={fieldErrors.preferred_contact}
        />
        <Input
          name="phone"
          type="tel"
          label="Phone *"
          placeholder="Your phone number"
          required
          error={fieldErrors.phone}
        />
      </div>

      {!simplified && (
        <Input
          name="event_date"
          type="date"
          label="Event Date (approximate is fine)"
        />
      )}

      {simplified && (
        <Input
          name="event_date"
          type="date"
          label="Event Date (approximate is fine)"
        />
      )}

      <Textarea
        name="message"
        label="Event Details"
        placeholder="Tell us about your event — type of event, vibe, audience, special requests..."
        error={fieldErrors.message}
      />

      <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Sending..." : "Send Inquiry"}
      </Button>
    </form>
  );
}
