import { createServiceClient } from "@/lib/supabase/server";

export type FulfillmentStatus =
  | "processing"
  | "fulfilled"
  | "failed"
  | "skipped";

/**
 * How long a record may sit in "processing" before we assume the run that
 * claimed it died (function timeout, cold-start kill, OOM, deploy mid-request)
 * and allow a Stripe retry to reclaim the lock.
 *
 * Without this, a crashed run leaves the record pinned at "processing" forever:
 * every retry returns 200 { duplicate: true }, Stripe stops retrying, and the
 * order is never fulfilled AND never marked failed — invisible in both queues.
 */
const STALE_PROCESSING_MS = 5 * 60 * 1000;

function isStaleProcessingRecord(updatedAt: string | null | undefined) {
  if (!updatedAt) return true;
  const updated = new Date(updatedAt).getTime();
  if (Number.isNaN(updated)) return true;
  return Date.now() - updated > STALE_PROCESSING_MS;
}

export async function lockFulfillmentRecord(
  stripeSessionId: string,
  eventId: string
) {
  const supabase = await createServiceClient();
  const { data: existing, error: fetchError } = await supabase
    .from("stripe_fulfillments")
    .select("*")
    .eq("stripe_session_id", stripeSessionId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(
      `Failed to read fulfillment record for ${stripeSessionId}: ${fetchError.message}`
    );
  }

  // Both "fulfilled" and "skipped" are TERMINAL. A replayed event (Stripe's
  // at-least-once delivery, a dashboard Resend, a second subscribed endpoint)
  // must never re-enter the fulfillment path — for a mixed cart that would POST
  // a second confirmed order to Printful, which ships and bills again. "skipped"
  // means a human owns the rest of this order; it is not an invitation to retry.
  if (existing?.status === "fulfilled" || existing?.status === "skipped") {
    return {
      alreadyFulfilled: true as const,
      inProgress: false as const,
      recordId: existing.id as string,
    };
  }

  if (existing?.status === "processing") {
    // Only treat it as genuinely in-flight if it was claimed recently. A stale
    // claim means the previous run died mid-fulfillment.
    if (!isStaleProcessingRecord(existing.updated_at)) {
      return {
        alreadyFulfilled: false as const,
        inProgress: true as const,
        recordId: existing.id as string,
      };
    }

    // Reclaim atomically. The read above and the write below are not a
    // transaction, so two retries arriving together would both see the same
    // stale row and both proceed to Printful. Pushing the staleness test into
    // the UPDATE predicate means the database decides the winner: exactly one
    // statement matches a row, the loser matches zero and backs off.
    // stripe_event_id is deliberately NOT overwritten — it records which event
    // originally claimed the lock, which is the only breadcrumb for
    // reconstructing what happened.
    const staleCutoff = new Date(Date.now() - STALE_PROCESSING_MS).toISOString();
    const { data: reclaimed, error: reclaimError } = await supabase
      .from("stripe_fulfillments")
      .update({
        // Deliberately does not touch `notes`. A record can carry a diagnostic
        // from an earlier failure ("Missing shipping address in Stripe
        // session"), and every webhook exit path overwrites notes anyway — so
        // writing a reclaim marker here would both destroy that diagnostic and
        // be wiped before anyone could read it. The reclaim is recorded via the
        // console.warn below, which persists in the function logs.
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("status", "processing")
      // Staleness lives in the predicate so the DB picks the winner. Mirrors
      // isStaleProcessingRecord(), including its treatment of a null
      // updated_at as stale — without the null branch the two would disagree
      // and such a row could never be reclaimed by any retry.
      .or(`updated_at.is.null,updated_at.lt.${staleCutoff}`)
      .select("id")
      .maybeSingle();

    if (reclaimError) {
      throw new Error(
        `Failed reclaiming stale lock for ${stripeSessionId}: ${reclaimError.message}`
      );
    }

    if (!reclaimed) {
      // Another retry won the race, or the original run finished between our
      // read and write. Either way this delivery must not proceed.
      console.warn("[stripe-fulfillment] lost stale-lock reclaim race", {
        stripeSessionId,
        eventId,
      });
      return {
        alreadyFulfilled: false as const,
        inProgress: true as const,
        recordId: existing.id as string,
      };
    }

    console.warn("[stripe-fulfillment] reclaimed stale processing lock", {
      stripeSessionId,
      claimedAt: existing.updated_at,
      eventId,
    });

    return {
      alreadyFulfilled: false as const,
      inProgress: false as const,
      recordId: reclaimed.id as string,
    };
  }

  // First claim (no row yet) or re-claim after a terminal "failed".
  //
  // This must NOT be an unguarded upsert. Two deliveries of the same event that
  // both read `existing === null` above would both upsert, both get the same
  // recordId back, and both proceed to create a Printful order — the exact
  // double-shipment the stale-lock hardening was meant to prevent, just through
  // the first-claim door instead.
  //
  // Insert claims the row via the unique constraint on stripe_session_id:
  // exactly one concurrent insert wins, the rest get 23505 and back off.
  if (!existing) {
    const { data: inserted, error: insertError } = await supabase
      .from("stripe_fulfillments")
      .insert({
        stripe_session_id: stripeSessionId,
        stripe_event_id: eventId,
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .maybeSingle();

    if (insertError) {
      // 23505 = unique_violation: a concurrent delivery claimed it first.
      if (insertError.code === "23505") {
        console.warn("[stripe-fulfillment] lost first-claim race", {
          stripeSessionId,
          eventId,
        });
        return {
          alreadyFulfilled: false as const,
          inProgress: true as const,
          recordId: null,
        };
      }

      throw new Error(
        `Failed to insert fulfillment record for ${stripeSessionId}: ${insertError.message}`
      );
    }

    if (!inserted) {
      throw new Error(
        `Failed to insert fulfillment record for ${stripeSessionId}: no row returned`
      );
    }

    return {
      alreadyFulfilled: false as const,
      inProgress: false as const,
      recordId: inserted.id as string,
    };
  }

  // Existing row in a non-terminal, non-processing state ("failed"). Re-claim it,
  // guarded on that status so we can't stomp a row another delivery just moved.
  const { data: reclaimedFailed, error: reclaimError } = await supabase
    .from("stripe_fulfillments")
    .update({
      status: "processing",
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .eq("status", existing.status)
    .select("id")
    .maybeSingle();

  if (reclaimError) {
    throw new Error(
      `Failed to re-claim fulfillment record for ${stripeSessionId}: ${reclaimError.message}`
    );
  }

  if (!reclaimedFailed) {
    console.warn("[stripe-fulfillment] lost re-claim race", {
      stripeSessionId,
      eventId,
      previousStatus: existing.status,
    });
    return {
      alreadyFulfilled: false as const,
      inProgress: true as const,
      recordId: existing.id as string,
    };
  }

  return {
    alreadyFulfilled: false as const,
    inProgress: false as const,
    recordId: reclaimedFailed.id as string,
  };
}

export async function updateFulfillmentRecord(params: {
  recordId: string;
  status: FulfillmentStatus;
  printfulOrderId?: string | null;
  notes?: string | null;
}) {
  const supabase = await createServiceClient();

  const update: {
    status: FulfillmentStatus;
    updated_at: string;
    printful_order_id?: string;
    notes?: string;
  } = {
    status: params.status,
    updated_at: new Date().toISOString(),
  };

  // Only write printful_order_id when we actually have one. Coercing undefined
  // to null here would erase it on any later write — and the error path calls
  // this with status "failed" and no id. That id is the only record that
  // Printful was billed and will ship; losing it means a real shipment becomes
  // untraceable and the audit script reports the order as never fulfilled.
  if (params.printfulOrderId) {
    update.printful_order_id = params.printfulOrderId;
  }

  if (params.notes) {
    update.notes = params.notes;
  }

  const { data: updated, error } = await supabase
    .from("stripe_fulfillments")
    .update(update)
    .eq("id", params.recordId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed updating fulfillment record ${params.recordId}: ${error.message}`
    );
  }

  // Supabase reports error === null when a filter matches zero rows. Without
  // this assertion a bad recordId would silently no-op and the webhook would
  // still report the order fulfilled.
  if (!updated) {
    throw new Error(
      `Fulfillment record ${params.recordId} not found — status "${params.status}" was not recorded.`
    );
  }
}
