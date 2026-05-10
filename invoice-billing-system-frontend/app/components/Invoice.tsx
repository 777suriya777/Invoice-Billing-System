import Link from 'next/link';
import Badge from './Badge';

interface InvoiceItem {
  itemName: string;
  unitPrice: number;
  quantity: number;
  amount: number;
}

interface Payment {
  amount: number;
  method: string;
  createdBy: string;
  paidAt: string;
}

export interface InvoiceData {
  id?: string | number;
  clientName: string;
  clientAddress: string;
  invoiceDate: string;
  dueDate: string;
  email?: string;
  items?: InvoiceItem[];
  taxRate?: number;
  subTotal?: number;
  taxAmount?: number;
  totalAmount: number | string;
  outStandingAmount: number | string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  payments?: Payment[];
}

export default function Invoice({ data }: { data: InvoiceData }) {
  if (!data) return null;

  const total = Number(data.totalAmount);
  const outstanding = Number(data.outStandingAmount);

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors group">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <p className="text-sm font-semibold text-slate-800 truncate">{data.clientName}</p>
          {data.status && <Badge status={data.status} />}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Issued {data.invoiceDate}
          {data.dueDate ? ` · Due ${data.dueDate}` : ''}
        </p>
      </div>

      <div className="ml-4 flex items-center gap-5 flex-shrink-0">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">
            {isNaN(total) ? String(data.totalAmount) : `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          {outstanding > 0 && (
            <p className="text-xs text-amber-600 font-medium">
              ₹{outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })} outstanding
            </p>
          )}
        </div>
        {data.id && (
          <Link
            href={`/invoices/${data.id}`}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
          >
            View →
          </Link>
        )}
      </div>
    </div>
  );
}
