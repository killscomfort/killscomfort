#!/usr/bin/env node
/**
 * READ-ONLY fulfillment audit. Writes nothing, changes nothing.
 *
 * Finds orders that may have been paid for but never actually shipped:
 *
 *   1. STUCK LOCKS       — stripe_fulfillments pinned at "processing". The run
 *                          that claimed the lock died; before the stale-lock fix
 *                          every Stripe retry returned "duplicate" and the order
 *                          was never fulfilled and never marked failed.
 *   2. FALSE FULFILLED   — status "fulfilled" with no printful_order_id. Under
 *                          the old code, hand-shipped orders (Kills Shorts) were
 *                          stamped "fulfilled" even though nothing was dispatched.
 *   3. FAILED            — status "failed": fulfillment threw and stopped.
 *   4. OPEN MANUAL       — orders flagged requires_manual_fulfillment that have
 *                          not reached the "done" column yet.
 *
 * Usage:
 *   node --env-file=.env.local scripts/check-fulfillment.mjs
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run with:  node --env-file=.env.local scripts/check-fulfillment.mjs"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

const STALE_MINUTES = 5;

function fmtMoney(cents) {
  return `$${(Number(cents || 0) / 100).toFixed(2)}`;
}

function ageMinutes(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  return Number.isNaN(ms) ? 0 : Math.floor(ms / 60000);
}

function ageDays(iso) {
  return Math.floor(ageMinutes(iso) / 1440);
}

function section(title) {
  console.log(`\n${"─".repeat(64)}\n${title}\n${"─".repeat(64)}`);
}

/** Attach order details to fulfillment rows via stripe_session_id. */
async function ordersBySession(sessionIds) {
  if (sessionIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from("orders")
    .select("order_number, customer_email, total_cents, stripe_session_id")
    .in("stripe_session_id", sessionIds);

  if (error) {
    console.warn(`  (could not join orders: ${error.message})`);
    return new Map();
  }
  return new Map((data || []).map((o) => [o.stripe_session_id, o]));
}

function describe(row, order) {
  const label = order
    ? `${order.order_number}  ${fmtMoney(order.total_cents)}  ${order.customer_email}`
    : `session ${row.stripe_session_id}`;
  return `${label}\n      claimed ${ageMinutes(row.updated_at)}m ago · ${row.notes || "no notes"}`;
}

let problems = 0;

async function main() {
  console.log("KillsComfort — fulfillment audit (read-only)");
  console.log(`Supabase: ${url}`);

  // 1. Stuck processing locks
  section("1. STUCK LOCKS  (processing, never resolved)");
  const { data: processing, error: procError } = await supabase
    .from("stripe_fulfillments")
    .select("*")
    .eq("status", "processing")
    .order("updated_at", { ascending: true });

  if (procError) {
    console.log(`  ERROR: ${procError.message}`);
  } else {
    const stale = (processing || []).filter(
      (r) => ageMinutes(r.updated_at) > STALE_MINUTES
    );
    if (stale.length === 0) {
      console.log("  None. ✓");
    } else {
      const orders = await ordersBySession(
        stale.map((r) => r.stripe_session_id)
      );
      problems += stale.length;
      for (const row of stale) {
        console.log(`  ⚠ ${describe(row, orders.get(row.stripe_session_id))}`);
      }
      console.log(
        `\n  ${stale.length} order(s) claimed a lock and never finished.\n` +
          "  These were paid. Verify each one shipped before clearing."
      );
    }
  }

  // 2. Marked fulfilled with no Printful order behind it
  section("2. FALSE FULFILLED  (fulfilled, no Printful order id)");
  const { data: fulfilled, error: fulError } = await supabase
    .from("stripe_fulfillments")
    .select("*")
    .eq("status", "fulfilled")
    .is("printful_order_id", null)
    .order("updated_at", { ascending: false });

  if (fulError) {
    console.log(`  ERROR: ${fulError.message}`);
  } else if (!fulfilled || fulfilled.length === 0) {
    console.log("  None. ✓");
  } else {
    const orders = await ordersBySession(
      fulfilled.map((r) => r.stripe_session_id)
    );
    problems += fulfilled.length;
    for (const row of fulfilled) {
      console.log(`  ⚠ ${describe(row, orders.get(row.stripe_session_id))}`);
    }
    console.log(
      `\n  ${fulfilled.length} order(s) read as fulfilled with nothing sent to Printful.\n` +
        "  Legacy hand-shipped orders look like this. Confirm each actually shipped."
    );
  }

  // 3. Outright failures
  section("3. FAILED  (fulfillment threw)");
  const { data: failed, error: failError } = await supabase
    .from("stripe_fulfillments")
    .select("*")
    .eq("status", "failed")
    .order("updated_at", { ascending: false });

  if (failError) {
    console.log(`  ERROR: ${failError.message}`);
  } else if (!failed || failed.length === 0) {
    console.log("  None. ✓");
  } else {
    const orders = await ordersBySession(failed.map((r) => r.stripe_session_id));
    problems += failed.length;
    for (const row of failed) {
      console.log(`  ✗ ${describe(row, orders.get(row.stripe_session_id))}`);
    }
  }

  // 4. Open manual queue
  section("4. OPEN MANUAL QUEUE  (needs you to pack and ship)");
  const { data: manual, error: manualError } = await supabase
    .from("orders")
    .select(
      "order_number, customer_name, customer_email, total_cents, fulfillment_stage, created_at, order_items(product_name, size, quantity)"
    )
    .eq("requires_manual_fulfillment", true)
    .neq("fulfillment_stage", "done")
    .order("created_at", { ascending: true });

  if (manualError) {
    console.log(
      `  ERROR: ${manualError.message}\n` +
        "  (If this says the column does not exist, apply\n" +
        "   supabase/migrations/20260820_manual_fulfillment_kanban.sql first.)"
    );
  } else if (!manual || manual.length === 0) {
    console.log("  Nothing waiting. ✓");
  } else {
    for (const order of manual) {
      const items = (order.order_items || [])
        .map(
          (i) =>
            `${i.product_name}${i.size ? ` (${i.size})` : ""} ×${i.quantity}`
        )
        .join(", ");
      const days = ageDays(order.created_at);
      const flag = days >= 3 ? ` ⚠ ${days}d old` : "";
      console.log(
        `  • ${order.order_number}  [${order.fulfillment_stage}]  ${fmtMoney(order.total_cents)}${flag}\n` +
          `      ${order.customer_name} <${order.customer_email}>\n` +
          `      ${items}`
      );
    }
    console.log(`\n  ${manual.length} order(s) awaiting shipment.`);
  }

  section("SUMMARY");
  if (problems === 0) {
    console.log("  No fulfillment anomalies found.");
  } else {
    console.log(
      `  ${problems} record(s) need a look. Nothing was modified — this script only reads.`
    );
  }
  console.log("");
}

main().catch((error) => {
  console.error("\nAudit failed:", error);
  process.exit(1);
});
