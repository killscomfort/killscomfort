import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, type, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const isDateLike =
    type === "date" || type === "datetime-local" || type === "time";

  return (
    <div className="terminal-input-wrap min-w-0 space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-near-black/80">
          {label}
        </label>
      )}
      <div>
        <input
          id={inputId}
          type={type}
          className={cn(
            "box-border h-[3.125rem] w-full min-w-0 max-w-full rounded-2xl border border-clay/70 bg-bone/80 px-4 py-3 text-base text-near-black placeholder:text-mid-gray",
          "focus:border-near-black focus:outline-none focus:ring-2 focus:ring-muted-gold/40",
          "transition-colors duration-200",
          isDateLike &&
            "input-date appearance-none leading-normal [-webkit-appearance:none]",
          error && "border-dried-blood",
          className
        )}
          {...props}
        />
      </div>
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
    <div className="terminal-input-wrap min-w-0 space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-near-black/80">
          {label}
        </label>
      )}
      <div>
        <textarea
          id={inputId}
          className={cn(
            "box-border min-h-[120px] w-full min-w-0 max-w-full resize-y rounded-[1.5rem] border border-clay/70 bg-bone/80 px-4 py-3 text-near-black placeholder:text-mid-gray",
          "focus:border-near-black focus:outline-none focus:ring-2 focus:ring-muted-gold/40",
          "transition-colors duration-200 min-h-[120px]",
          error && "border-dried-blood",
          className
        )}
          {...props}
        />
      </div>
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
    <div className="terminal-input-wrap min-w-0 space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-near-black/80">
          {label}
        </label>
      )}
      <div>
        <select
          id={inputId}
          className={cn(
            "box-border h-[3.125rem] w-full min-w-0 max-w-full rounded-2xl border border-clay/70 bg-bone/80 px-4 py-3 text-base text-near-black",
          "focus:border-near-black focus:outline-none focus:ring-2 focus:ring-muted-gold/40",
          "transition-colors duration-200",
          error && "border-dried-blood",
          className
        )}
        {...props}
      >
        <option value="" disabled>
          Select...
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        </select>
      </div>
      {error && <p className="text-sm text-dried-blood">{error}</p>}
    </div>
  );
}
