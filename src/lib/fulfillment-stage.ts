import type { FulfillmentStage } from "@/types/database";

/** Kanban columns, in pipeline order, for hand-shipped orders. */
export const FULFILLMENT_STAGES: FulfillmentStage[] = [
  "paid",
  "packed",
  "shipped",
  "done",
];

export const FULFILLMENT_STAGE_LABELS: Record<FulfillmentStage, string> = {
  paid: "Paid",
  packed: "Packed",
  shipped: "Shipped",
  done: "Done",
};

/** One-line hint shown under each empty column. */
export const FULFILLMENT_STAGE_HINTS: Record<FulfillmentStage, string> = {
  paid: "New orders land here",
  packed: "Boxed and labelled",
  shipped: "Handed to carrier",
  done: "Closed out",
};

export function normalizeFulfillmentStage(stage: string): FulfillmentStage {
  return FULFILLMENT_STAGES.includes(stage as FulfillmentStage)
    ? (stage as FulfillmentStage)
    : "paid";
}

export function getFulfillmentStageLabel(stage: string): string {
  return FULFILLMENT_STAGE_LABELS[normalizeFulfillmentStage(stage)];
}
