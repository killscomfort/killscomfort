import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm text-bone/80">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full border border-clay/30 bg-warm-charcoal/80 px-4 py-3 text-bone placeholder:text-mid-gray",
          "focus:border-muted-gold focus:outline-none focus:ring-1 focus:ring-muted-gold/50",
          "transition-colors duration-200",
          error && "border-dried-blood",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-dried-blood">{error}</p>}
    </div>
  );
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm text-bone/80">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "w-full resize-y border border-clay/30 bg-warm-charcoal/80 px-4 py-3 text-bone placeholder:text-mid-gray",
          "focus:border-muted-gold focus:outline-none focus:ring-1 focus:ring-muted-gold/50",
          "transition-colors duration-200 min-h-[120px]",
          error && "border-dried-blood",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-dried-blood">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: readonly string[] | string[];
}

export function Select({
  label,
  error,
  options,
  className,
  id,
  ...props
}: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm text-bone/80">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          "w-full border border-clay/30 bg-warm-charcoal/80 px-4 py-3 text-bone",
          "focus:border-muted-gold focus:outline-none focus:ring-1 focus:ring-muted-gold/50",
          "transition-colors duration-200",
          error && "border-dried-blood",
          className
        )}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-dried-blood">{error}</p>}
    </div>
  );
}
