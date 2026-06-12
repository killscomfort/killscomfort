import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function MiamiAreaLabel({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-bone/55",
        className
      )}
    >
      <MapPin className="h-3 w-3 shrink-0 text-muted-gold" aria-hidden />
      Miami Area
    </p>
  );
}
