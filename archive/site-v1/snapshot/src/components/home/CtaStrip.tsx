import { Button } from "@/components/ui/Button";
import { BrandText } from "@/components/ui/BrandText";

export function CtaStrip() {
  return (
    <section className="section-padding border-y border-clay/20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl text-bone sm:text-5xl">
          <BrandText variant="title" as="span">
            Ready to Bring the Energy?
          </BrandText>
        </h2>
        <p className="mt-4 text-xl text-bone/70 sm:text-2xl">
          <BrandText variant="inline">
            Let&apos;s talk. Every inquiry gets a personal response.
          </BrandText>
        </p>
        <Button href="/book" size="lg" className="mt-8">
          Book an Inquiry
        </Button>
      </div>
    </section>
  );
}
