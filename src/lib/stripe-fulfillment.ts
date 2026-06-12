import { createServiceClient } from "@/lib/supabase/server";

export type FulfillmentStatus =
  | "processing"
  | "fulfilled"
  | "failed"
  | "skipped";

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

  if (existing?.status === "fulfilled") {
    return {
      alreadyFulfilled: true as const,
      inProgress: false as const,
      recordId: existing.id as string,
    };
  }

  if (existing?.status === "processing") {
    return {
      alreadyFulfilled: false as const,
      inProgress: true as const,
      recordId: existing.id as string,
    };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("stripe_fulfillments")
    .upsert(
      {
        stripe_session_id: stripeSessionId,
        stripe_event_id: eventId,
        status: "processing",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_session_id" }
    )
    .select("id")
    .single();

  if (insertError || !inserted) {
    throw new Error(
      `Failed to upsert fulfillment record for ${stripeSessionId}: ${insertError?.message || "unknown error"}`
    );
  }

  return {
    alreadyFulfilled: false as const,
    inProgress: false as const,
    recordId: inserted.id as string,
  };
}

export async function updateFulfillmentRecord(params: {
  recordId: string;
  status: FulfillmentStatus;
  printfulOrderId?: string | null;
  notes?: string | null;
}) {
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("stripe_fulfillments")
    .update({
      status: params.status,
      printful_order_id: params.printfulOrderId || null,
      notes: params.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.recordId);

  if (error) {
    throw new Error(
      `Failed updating fulfillment record ${params.recordId}: ${error.message}`
    );
  }
}
