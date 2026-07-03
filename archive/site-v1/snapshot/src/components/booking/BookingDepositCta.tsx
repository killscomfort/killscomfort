import Link from "next/link";

export function BookingDepositCta() {
  return (
    <div className="mt-16 border border-clay/20 p-8 text-center">
      <h3 className="mb-2 text-lg font-bold text-bone">Already have a quote?</h3>
      <p className="mx-auto mb-6 max-w-md text-sm text-bone/60">
        If we&apos;ve already discussed your event and you&apos;re ready to lock in
        the date, you can pay your booking deposit here.
      </p>
      <Link
        href="/services"
        className="inline-block border border-muted-gold/50 px-6 py-3 text-sm text-muted-gold transition-colors duration-200 hover:bg-muted-gold/10"
      >
        Pay Deposit
      </Link>
    </div>
  );
}
