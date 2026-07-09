"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles } from "lucide-react";
import {
  createNewsletterDraft,
  generateNewsletterDraftFromEvents,
} from "@/lib/admin/actions";
import { Button } from "@/components/ui/Button";

export function NewsletterDraftActions() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function refresh() {
    router.refresh();
  }

  function handleGenerate() {
    startTransition(async () => {
      await generateNewsletterDraftFromEvents();
      refresh();
    });
  }

  function handleCreateBlank() {
    startTransition(async () => {
      const formData = new FormData();
      await createNewsletterDraft(formData);
      refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        size="sm"
        onClick={handleGenerate}
        disabled={isPending}
        className="justify-center"
      >
        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
        Generate from events
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
        Blank draft
      </Button>
    </div>
  );
}
