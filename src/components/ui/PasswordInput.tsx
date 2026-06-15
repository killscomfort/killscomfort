"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export function PasswordInput({
  label,
  error,
  className,
  id,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="min-w-0 space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm text-bone/80">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          className={cn(
            "box-border w-full min-w-0 max-w-full border border-clay/30 bg-warm-charcoal/80 py-3 pl-4 pr-12 text-base text-bone placeholder:text-mid-gray",
            "h-[3.125rem] focus:border-muted-gold focus:outline-none focus:ring-1 focus:ring-muted-gold/50",
            "transition-colors duration-200",
            error && "border-dried-blood",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-bone/45 transition-colors hover:text-bone"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
      {error && <p className="text-sm text-dried-blood">{error}</p>}
    </div>
  );
}
