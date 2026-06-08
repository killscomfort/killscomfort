"use client";

import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/merch";
import { AcceptedPaymentMethods } from "@/components/checkout/AcceptedPaymentMethods";
import { CheckoutPaymentMethods } from "@/components/checkout/CheckoutPaymentMethods";
import { CheckoutPaymentScripts } from "@/components/checkout/CheckoutPaymentScripts";

type CheckoutPaymentStepProps = {
  orderNumber: string;
  paypalOrderId: string;
  totalCents: number;
  demoMode?: boolean;
  error: string;
  editLabel?: string;
  applePayEnabled?: boolean;
  applePayDomainName?: string;
  onCapture: (paypalOrderId: string) => Promise<void>;
  onError: (message: string) => void;
  onEdit: () => void;
};

export function CheckoutPaymentStep({
  orderNumber,
  paypalOrderId,
  totalCents,
  demoMode,
  error,
  editLabel = "Edit details",
  applePayEnabled = false,
  applePayDomainName,
  onCapture,
  onError,
  onEdit,
}: CheckoutPaymentStepProps) {
  return (
    <div className="mt-6">
      <p className="text-sm text-bone/70">
        Order <span className="text-muted-gold">{orderNumber}</span>
        {demoMode
          ? " — test payment (no charge)."
          : ` — ${formatPrice(totalCents)} due.`}
      </p>

      {!demoMode && (
        <>
          <AcceptedPaymentMethods />
          <p className="mt-4 text-xs uppercase tracking-widest text-bone/50">
            Choose a payment method
          </p>
        </>
      )}

      {demoMode ? (
        <Button
          type="button"
          className="mt-4 w-full"
          onClick={async () => {
            try {
              onError("");
              await onCapture(paypalOrderId);
            } catch (err) {
              onError(err instanceof Error ? err.message : "Payment failed.");
            }
          }}
        >
          Complete Test Payment ({formatPrice(totalCents)})
        </Button>
      ) : (
        <>
          <CheckoutPaymentScripts />
          <div className="mt-4">
            <CheckoutPaymentMethods
              paypalOrderId={paypalOrderId}
              totalCents={totalCents}
              applePayEnabled={applePayEnabled}
              applePayDomainName={applePayDomainName}
              onCapture={onCapture}
              onError={onError}
            />
          </div>
        </>
      )}

      {error && <p className="mt-4 text-sm text-dried-blood">{error}</p>}

      <button
        type="button"
        onClick={onEdit}
        className="mt-4 text-xs uppercase tracking-widest text-bone/50 hover:text-bone"
      >
        {editLabel}
      </button>
    </div>
  );
}
