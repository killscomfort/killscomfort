interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminCard({ children, className = "" }: AdminCardProps) {
  return (
    <div
      className={`border border-clay/20 bg-warm-charcoal/50 p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function AdminPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AdminCard>
      <h2 className="text-display text-lg uppercase text-bone">{title}</h2>
      <div className="mt-4">{children}</div>
    </AdminCard>
  );
}
