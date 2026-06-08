"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EVENT_TYPES, BUDGET_RANGES, CONTACT_METHODS } from "@/lib/constants";

interface InquiryFormProps {
  simplified?: boolean;
  source?: string;
}

export function InquiryForm({
  simplified = false,
  source = "website",
}: InquiryFormProps) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [preferredContact, setPreferredContact] = useState("");

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
      event_type: form.get("event_type") as string,
      event_date: (form.get("event_date") as string) || undefined,
      event_location: (form.get("event_location") as string) || undefined,
      budget_range: (form.get("budget_range") as string) || undefined,
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

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="border border-moss-green/40 bg-moss-green/10 p-8 text-center">
        <h3 className="text-display text-2xl uppercase text-bone">Message Received</h3>
        <p className="mt-4 text-bone/70">
          Thanks for reaching out. Gregory reviews every inquiry personally and
          will respond within 24–48 hours. Check your email for a confirmation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          onChange={(e) => setPreferredContact(e.target.value)}
        />
        <Input
          name="phone"
          type="tel"
          label={preferredContact === "Phone" ? "Phone *" : "Phone"}
          placeholder={preferredContact === "Phone" ? "Your phone number" : "(optional)"}
          required={preferredContact === "Phone"}
          error={fieldErrors.phone}
        />
      </div>

      {!simplified && (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <Select
              name="event_type"
              label="Event Type *"
              options={EVENT_TYPES}
              required
              error={fieldErrors.event_type}
            />
            <Input name="event_date" type="date" label="Event Date" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              name="event_location"
              label="Event Location / Venue"
              placeholder="City, venue name..."
            />
            <Select
              name="budget_range"
              label="Estimated Budget"
              options={BUDGET_RANGES}
            />
          </div>
        </>
      )}

      {simplified && (
        <div className="grid gap-6 sm:grid-cols-2">
          <Select
            name="event_type"
            label="Event Type *"
            options={EVENT_TYPES}
            required
            error={fieldErrors.event_type}
          />
          <Input name="event_date" type="date" label="Event Date" />
        </div>
      )}

      <Textarea
        name="message"
        label="Message / Details"
        placeholder="Tell us about your event, vibe, audience..."
        error={fieldErrors.message}
      />

      <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Sending..." : "Send Inquiry"}
      </Button>
    </form>
  );
}
