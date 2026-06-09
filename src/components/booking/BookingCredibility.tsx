const BOOKING_INCLUDES = [
  "Custom set tailored to your event and audience",
  "Professional sound equipment (or integration with your venue's system)",
  "Pre-event consultation to nail the vibe",
  "Flexible genres — house, techno, hip-hop, and everything between",
] as const;

export function BookingCredibility() {
  return (
    <>
      <div className="mb-12 grid gap-6 sm:grid-cols-3">
        <div className="border border-clay/20 p-6 text-center">
          <p className="mb-2 text-2xl font-bold text-bone">150+</p>
          <p className="text-sm text-bone/60">Events played</p>
        </div>
        <div className="border border-clay/20 p-6 text-center">
          <p className="mb-2 text-2xl font-bold text-bone">SAE</p>
          <p className="text-sm text-bone/60">Institute trained</p>
        </div>
        <div className="border border-clay/20 p-6 text-center">
          <p className="mb-2 text-2xl font-bold text-bone">Miami</p>
          <p className="text-sm text-bone/60">Based &amp; available</p>
        </div>
      </div>

      <div className="mb-12 space-y-4">
        <h3 className="text-lg font-medium text-bone">Every booking includes</h3>
        <div className="grid gap-3 text-sm text-bone/70 sm:grid-cols-2">
          {BOOKING_INCLUDES.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <span className="mt-0.5 text-muted-gold">✦</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function BookingTestimonial() {
  return (
    <div className="my-12 border-l-2 border-muted-gold/50 pl-6">
      <p className="text-sm italic leading-relaxed text-bone/80">
        &ldquo;Gregory delivered exactly what we needed — raw energy with real
        professionalism. Already planning the next one.&rdquo;
      </p>
      <p className="mt-3 text-xs text-bone/50">— Festival Coordinator</p>
    </div>
  );
}
