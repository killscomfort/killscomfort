import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
  size?: "sm" | "md" | "lg";
}

const variants: Record<Variant, string> = {
  primary:
    "bg-muted-gold text-near-black hover:bg-desert-sand border border-muted-gold",
  secondary:
    "bg-transparent text-bone border border-clay/60 hover:bg-moss-green/40 hover:border-muted-gold",
  ghost: "bg-transparent text-bone hover:bg-warm-charcoal border border-transparent",
  outline:
    "bg-transparent text-bone border border-clay/60 hover:border-muted-gold hover:text-muted-gold",
};

const sizes = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center text-lg tracking-wide transition-all duration-300",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
