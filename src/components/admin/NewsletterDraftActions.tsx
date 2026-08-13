"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles } from "lucide-react";
import {
  createNewsletterDraft,
  generateNewsletterDraftFromEvents,
} from "@/lib/admin/actions";
import { Button } from "@/components/ui/Button";

export function NewsletterDraftActions() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function refresh() {
    router.refresh();
  }

  function handleGenerate() {
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        await generateNewsletterDraftFromEvents();
        setMessage("This week's draft is ready — review, approve, then send.");
        refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not generate draft. Sign in as admin and try again."
        );
      }
    });
  }

  function handleCreateBlank() {
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        const formData = new FormData();
        await createNewsletterDraft(formData);
        setMessage("Blank draft created.");
        refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not create draft. Sign in as admin and try again."
        );
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="border border-dried-blood/40 bg-dried-blood/10 px-3 py-2 text-xs text-dried-blood">
          {error}
        </p>
      )}
      {message && (
        <p className="border border-white/10 bg-white/5 px-3 py-2 text-xs text-bone/70">
          {message}
        </p>
      )}
      <Button
        type="button"
        size="sm"
        onClick={handleGenerate}
        disabled={isPending}
        className="justify-center"
      >
        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
        {isPending ? "Creating…" : "Generate this week's draft"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCreateBlank}
        disabled={isPending}
        className="justify-center"
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Create blank draft
      </Button>
    </div>
  );
}
