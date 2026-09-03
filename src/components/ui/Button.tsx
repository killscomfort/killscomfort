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
    "border border-near-black bg-near-black text-bone hover:-translate-y-0.5 hover:bg-[#3b332b]",
  secondary:
    "border border-clay bg-desert-sand text-near-black hover:-translate-y-0.5 hover:bg-[#e8d9c1]",
  ghost: "border border-transparent bg-transparent text-near-black hover:bg-desert-sand/70",
  outline:
    "border border-clay bg-bone/60 text-near-black hover:-translate-y-0.5 hover:border-near-black",
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
    "inline-flex items-center justify-center rounded-full text-sm font-medium tracking-[0.18em] uppercase transition-all duration-300",
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
