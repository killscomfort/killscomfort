import { cn } from "@/lib/utils";
import { BrandText } from "@/components/ui/BrandText";

interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  label,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12 max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {label && (
        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-near-black/45">
          <BrandText variant="label">{label}</BrandText>
        </p>
      )}
      <h2 className="text-display text-4xl uppercase leading-none text-near-black sm:text-5xl lg:text-6xl">
        <BrandText variant="title" as="span">
          {title}
        </BrandText>
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-near-black/65 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
