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
        <p className="mb-3 text-2xl text-muted-gold sm:text-3xl">
          <BrandText variant="label">{label}</BrandText>
        </p>
      )}
      <h2 className="text-4xl leading-none text-bone sm:text-5xl lg:text-6xl">
        <BrandText variant="title" as="span">
          {title}
        </BrandText>
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-bone/70 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
