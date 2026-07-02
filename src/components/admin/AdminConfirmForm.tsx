"use client";

import type { ReactNode } from "react";

type Props = {
  action: (formData: FormData) => Promise<void>;
  confirmMessage: string;
  children: ReactNode;
  className?: string;
  hiddenFields?: Record<string, string>;
};

export function AdminConfirmForm({
  action,
  confirmMessage,
  children,
  className,
  hiddenFields,
}: Props) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      {children}
    </form>
  );
}
