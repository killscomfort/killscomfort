"use client";

import { useEffect, useState } from "react";
import { canUseApplePay } from "@/lib/paypal-client";

/** Waits for Apple's JS SDK so Apple Pay buttons can render reliably on Safari. */
export function useApplePayReady(enabled = true) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    if (canUseApplePay()) {
      setReady(true);
      return;
    }

    const check = () => {
      if (canUseApplePay()) {
        setReady(true);
        return true;
      }
      return false;
    };

    if (check()) return;

    const interval = window.setInterval(() => {
      if (check()) window.clearInterval(interval);
    }, 250);

    const timeout = window.setTimeout(() => window.clearInterval(interval), 15000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [enabled]);

  return ready;
}
