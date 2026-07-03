"use client";

interface DeleteButtonProps {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label?: string;
  confirmMessage?: string;
}

export function DeleteButton({
  action,
  id,
  label = "Delete",
  confirmMessage = "Delete this item? This cannot be undone.",
}: DeleteButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs uppercase tracking-widest text-dried-blood hover:text-bone"
      >
        {label}
      </button>
    </form>
  );
}
