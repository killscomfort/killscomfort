"use client";

interface DeleteButtonProps {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label?: string;
}

export function DeleteButton({
  action,
  id,
  label = "Delete",
}: DeleteButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Delete this item? This cannot be undone.")) {
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
