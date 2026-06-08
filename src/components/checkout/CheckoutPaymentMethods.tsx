"use client";

import { useEffect, useMemo } from "react";
import {
  PayPalProvider,
  PayPalOneTimePaymentButton,
  PayPalGuestPaymentButton,
  VenmoOneTimePaymentButton,
  GooglePayOneTimePaymentButton,
  ApplePayOneTimePaymentButton,
  PayPalCardFieldsProvider,
  PayPalCardNumberField,
  PayPalCardExpiryField,
  PayPalCardCvvField,
  useEligibleMethods,
  usePayPal,
  usePayPalCardFieldsOneTimePaymentSession,
  INSTANCE_LOADING_STATE,
} from "@paypal/react-paypal-js/sdk-v6";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/constants";
import {
  canUseApplePay,
  formatPayPalAmount,
  getGooglePayEnvironment,
  getPayPalEnvironment,
  getPublicPayPalClientId,
  PAYPAL_CHECKOUT_COMPONENTS,
  PAYPAL_STANDARD_COMPONENTS,
} from "@/lib/paypal-client";

type CheckoutPaymentMethodsProps = {
  paypalOrderId: string;
  totalCents: number;
  onCapture: (paypalOrderId: string) => Promise<void>;
  onError: (message: string) => void;
  variant?: "full" | "standard";
};

function WalletButtons({
  paypalOrderId,
  totalCents,
  onCapture,
  onError,
  variant = "full",
}: CheckoutPaymentMethodsProps) {
  const { eligiblePaymentMethods, isLoading } = useEligibleMethods({
    payload: { currencyCode: "USD" },
  });

  const amount = formatPayPalAmount(totalCents);
  const createOrder = () => Promise.resolve({ orderId: paypalOrderId });

  const onApproveStandard = async (data: { orderId: string }) => {
    try {
      await onCapture(data.orderId);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Payment failed.");
    }
  };

  const onApproveApplePay = async (data: {
    approveApplePayPayment?: { id: string };
  }) => {
    const orderId = data.approveApplePayPayment?.id;
    if (!orderId) {
      onError("Apple Pay did not return an order ID.");
      return;
    }
    try {
      await onCapture(orderId);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Apple Pay failed.");
    }
  };

  if (isLoading) {
    return <p className="text-sm text-bone/50">Loading payment options...</p>;
  }

  const applePayConfig = eligiblePaymentMethods?.isEligible("applepay")
    ? eligiblePaymentMethods.getDetails("applepay")?.config
    : null;

  const googlePayConfig = eligiblePaymentMethods?.isEligible("googlepay")
    ? eligiblePaymentMethods.getDetails("googlepay")?.config
    : null;

  return (
    <div className="space-y-3">
      {variant === "full" && canUseApplePay() && applePayConfig && (
        <ApplePayOneTimePaymentButton
          applePayConfig={applePayConfig}
          paymentRequest={{
            countryCode: "US",
            currencyCode: "USD",
            total: {
              label: SITE.name,
              amount,
              type: "final",
            },
          }}
          createOrder={createOrder}
          onApprove={onApproveApplePay}
          onError={(err) => onError(err.message)}
          applePaySessionVersion={4}
          buttonstyle="black"
          type="buy"
          locale="en"
        />
      )}

      {variant === "full" && googlePayConfig && (
        <GooglePayOneTimePaymentButton
          googlePayConfig={googlePayConfig}
          transactionInfo={{
            countryCode: "US",
            currencyCode: "USD",
            totalPriceStatus: "FINAL",
            totalPrice: amount,
          }}
          environment={getGooglePayEnvironment()}
          createOrder={createOrder}
          onApprove={async () => onApproveStandard({ orderId: paypalOrderId })}
          onError={(err) => onError(err.message)}
          buttonType="pay"
          buttonColor="black"
          buttonSizeMode="fill"
        />
      )}

      <PayPalOneTimePaymentButton
        orderId={paypalOrderId}
        onApprove={onApproveStandard}
        onError={(data) => onError(data.message || "PayPal payment failed.")}
        type="pay"
      />

      <VenmoOneTimePaymentButton
        orderId={paypalOrderId}
        onApprove={onApproveStandard}
        onError={(data) => onError(data.message || "Venmo payment failed.")}
      />

      <PayPalGuestPaymentButton
        orderId={paypalOrderId}
        onApprove={onApproveStandard}
        onError={(data) => onError(data.message || "Card payment failed.")}
      />
    </div>
  );
}

function CardFieldsPayment({
  paypalOrderId,
  totalCents,
  onCapture,
  onError,
  variant = "full",
}: CheckoutPaymentMethodsProps) {
  const { submit, submitResponse, error } = usePayPalCardFieldsOneTimePaymentSession();

  useEffect(() => {
    if (variant !== "full" || !error) return;
    onError(error.message || "Card payment failed.");
  }, [error, onError, variant]);

  useEffect(() => {
    if (variant !== "full" || !submitResponse) return;

    if (submitResponse.state === "succeeded") {
      void onCapture(submitResponse.data.orderId || paypalOrderId);
    } else if (submitResponse.state === "failed") {
      onError(submitResponse.data.message || "Card payment failed.");
    }
  }, [submitResponse, onCapture, onError, paypalOrderId, variant]);

  if (variant !== "full") return null;

  const fieldStyles = {
    height: "3rem",
    marginBottom: "0.75rem",
  };

  return (
    <PayPalCardFieldsProvider
      amount={{
        value: formatPayPalAmount(totalCents),
        currencyCode: "USD",
      }}
    >
      <div className="mt-6 border-t border-clay/20 pt-6">
        <p className="mb-4 text-xs uppercase tracking-widest text-bone/50">
          Or pay with card
        </p>
        <PayPalCardNumberField placeholder="Card number" containerStyles={fieldStyles} />
        <div className="grid grid-cols-2 gap-3">
          <PayPalCardExpiryField placeholder="MM/YY" containerStyles={fieldStyles} />
          <PayPalCardCvvField placeholder="CVV" containerStyles={fieldStyles} />
        </div>
        <Button
          type="button"
          className="mt-2 w-full"
          onClick={() => submit(paypalOrderId)}
        >
          Pay with Card ({formatPayPalAmount(totalCents)})
        </Button>
      </div>
    </PayPalCardFieldsProvider>
  );
}

function PaymentMethodsInner(props: CheckoutPaymentMethodsProps) {
  const { loadingStatus, error } = usePayPal();

  if (loadingStatus === INSTANCE_LOADING_STATE.PENDING) {
    return <p className="text-sm text-bone/50">Loading secure checkout...</p>;
  }

  if (loadingStatus === INSTANCE_LOADING_STATE.REJECTED) {
    return (
      <p className="text-sm text-dried-blood">
        {error?.message || "Could not load payment options."}
      </p>
    );
  }

  return (
    <>
      <WalletButtons {...props} />
      <CardFieldsPayment {...props} />
    </>
  );
}

export function CheckoutPaymentMethods({
  variant = "full",
  ...props
}: CheckoutPaymentMethodsProps) {
  const clientId = getPublicPayPalClientId();
  const environment = useMemo(() => getPayPalEnvironment(), []);
  const components =
    variant === "standard"
      ? [...PAYPAL_STANDARD_COMPONENTS]
      : [...PAYPAL_CHECKOUT_COMPONENTS];

  if (!clientId) {
    return (
      <p className="text-sm text-dried-blood">
        Payment is not configured. Contact support to complete your order.
      </p>
    );
  }

  return (
    <PayPalProvider
      clientId={clientId}
      environment={environment}
      components={components}
      pageType="checkout"
      locale="en_US"
    >
      <PaymentMethodsInner variant={variant} {...props} />
    </PayPalProvider>
  );
}
