const METHODS = [
  { id: "paypal", label: "PayPal" },
  { id: "venmo", label: "Venmo" },
  { id: "card", label: "Debit / Credit" },
  { id: "apple", label: "Apple Pay" },
  { id: "google", label: "Google Pay" },
] as const;

type AcceptedPaymentMethodsProps = {
  compact?: boolean;
};

export function AcceptedPaymentMethods({ compact = false }: AcceptedPaymentMethodsProps) {
  return (
    <div className={compact ? "mt-2" : "mt-3"}>
      {!compact && (
        <p className="text-xs uppercase tracking-widest text-near-black/45">
          Accepted payment methods
        </p>
      )}
      <ul
        className={`flex flex-wrap gap-2 ${compact ? "" : "mt-2"}`}
        aria-label="Accepted payment methods"
      >
        {METHODS.map((method) => (
          <li
            key={method.id}
            className="rounded-full border border-clay/70 bg-bone/70 px-2.5 py-1 text-[11px] uppercase tracking-wider text-near-black/65"
          >
            {method.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
