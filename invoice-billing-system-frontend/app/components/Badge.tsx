type BadgeVariant = 'draft' | 'sent' | 'paid' | 'partial' | 'default';

const variantClasses: Record<BadgeVariant, string> = {
  draft: 'bg-slate-100 text-slate-600 ring-slate-200',
  sent: 'bg-blue-50 text-blue-700 ring-blue-200',
  paid: 'bg-green-50 text-green-700 ring-green-200',
  partial: 'bg-amber-50 text-amber-700 ring-amber-200',
  default: 'bg-slate-100 text-slate-600 ring-slate-200',
};

function getVariant(status: string): BadgeVariant {
  const s = (status ?? '').toLowerCase();
  if (s === 'draft') return 'draft';
  if (s === 'sent') return 'sent';
  if (s === 'paid') return 'paid';
  if (s === 'partially paid') return 'partial';
  return 'default';
}

export default function Badge({ status }: { status: string }) {
  const variant = getVariant(status);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${variantClasses[variant]}`}
    >
      {status}
    </span>
  );
}
