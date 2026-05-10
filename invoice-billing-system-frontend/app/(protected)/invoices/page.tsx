'use client';

import { useState, useEffect } from 'react';
import authFetch from '@/lib/authFetch';
import { useRouter } from 'next/navigation';
import Badge from '@/app/components/Badge';
import { FileText, Plus, AlertCircle, Loader2, ChevronRight } from 'lucide-react';

interface Invoice {
  id: string | number;
  clientName?: string;
  status: string;
  totalAmount: number | string;
  outstandingAmount?: number | string;
  outStandingAmount?: number | string;
  dueDate?: string;
  invoiceDate?: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const router = useRouter();

  useEffect(() => {
    async function fetchInvoices() {
      try {
        setError('');
        setLoading(true);
        const response = await authFetch('http://localhost:3000/invoices', { method: 'GET' });
        const data = await response.json();
        setInvoices(data);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  const filters = ['All', 'Draft', 'Sent', 'Partially Paid', 'Paid'];
  const filtered =
    activeFilter === 'All' ? invoices : invoices.filter((inv) => inv.status === activeFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500">Loading invoices…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 rounded-xl max-w-md">
        <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500 mt-1">
            {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'} total
          </p>
        </div>
        <button
          onClick={() => router.push('/invoices/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Invoice
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeFilter === filter
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <FileText size={22} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              {activeFilter === 'All' ? 'No invoices yet' : `No ${activeFilter} invoices`}
            </p>
            {activeFilter === 'All' && (
              <button
                onClick={() => router.push('/invoices/new')}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Plus size={15} />
                Create Invoice
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">
                    Invoice ID
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">
                    Client
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">
                    Status
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">
                    Total
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">
                    Outstanding
                  </th>
                  <th className="px-6 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((inv) => {
                  const outstanding = inv.outStandingAmount ?? inv.outstandingAmount ?? 0;
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono font-medium text-slate-600">
                          #{String(inv.id).padStart(4, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-900">
                          {inv.clientName || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={inv.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-slate-900">
                          ₹{Number(inv.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`text-sm font-medium ${
                            Number(outstanding) > 0 ? 'text-amber-600' : 'text-green-600'
                          }`}
                        >
                          ₹{Number(outstanding).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight
                          size={16}
                          className="text-slate-300 group-hover:text-slate-500 transition-colors ml-auto"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
