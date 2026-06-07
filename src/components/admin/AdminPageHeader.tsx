interface AdminPageHeaderProps {
  title: string;
  description?: string;
}

export function AdminPageHeader({ title, description }: AdminPageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-display text-3xl uppercase text-bone">{title}</h1>
      {description && (
        <p className="mt-2 text-sm text-bone/60">{description}</p>
      )}
    </div>
  );
}
