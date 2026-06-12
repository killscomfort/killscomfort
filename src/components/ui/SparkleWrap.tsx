import { cn } from "@/lib/utils";

type SparkleWrapProps = {
  children: React.ReactNode;
  className?: string;
};

export function SparkleWrap({ children, className }: SparkleWrapProps) {
  const fullWidth = className?.includes("w-full");

  return (
    <span className={cn("sparkle-item relative inline-flex", className)}>
      <span aria-hidden className="sparkle-item__aura" />
      <span aria-hidden className="sparkle-item__shine" />
      <span aria-hidden className="sparkle-item__spark sparkle-item__spark--1">
        ✦
      </span>
      <span aria-hidden className="sparkle-item__spark sparkle-item__spark--2">
        ✦
      </span>
      <span aria-hidden className="sparkle-item__spark sparkle-item__spark--3">
        ✦
      </span>
      <span
        className={cn(
          "relative z-[1]",
          fullWidth ? "block w-full" : "inline-flex"
        )}
      >
        {children}
      </span>
    </span>
  );
}
