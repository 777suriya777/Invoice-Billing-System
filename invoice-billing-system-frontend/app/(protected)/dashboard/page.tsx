'use client';

import { useState, useEffect } from 'react';
import authFetch from '@/lib/authFetch';
import Invoice, { InvoiceData } from '@/app/components/Invoice';
import { FileText, DollarSign, TrendingUp, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface Report {
  totalInvoices: number;
  totalAmountBilled: number;
  totalRevenue: number;
  totalOutstandingAmount: number;
  unpaidInvoices: InvoiceData[];
  paidInvoices: InvoiceData[];
  partiallyPaidInvoices: InvoiceData[];
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1.5">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function InvoiceSection({
  title,
  invoices,
  emptyLabel,
}: {
  title: string;
  invoices: InvoiceData[];
  emptyLabel: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {invoices.length}
        </span>
      </div>
      <div className="divide-y divide-slate-50">
        {invoices.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400 text-center">{emptyLabel}</p>
        ) : (
          invoices.map((inv, i) => <Invoice key={i} data={inv} />)
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchReport() {
    try {
      setError('');
      setLoading(true);
      const response = await authFetch('http://localhost:3000/report', { method: 'GET' });
      const data = await response.json();
      setReport(data);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 rounded-xl max-w-md">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <button
          onClick={fetchReport}
          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    );
  }

  if (!report) return null;

  const fmt = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Here&apos;s an overview of your billing activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Invoices"
          value={report.totalInvoices}
          icon={FileText}
          color="bg-indigo-500"
        />
        <StatCard
          label="Total Billed"
          value={fmt(report.totalAmountBilled)}
          icon={DollarSign}
          color="bg-blue-500"
        />
        <StatCard
          label="Revenue Collected"
          value={fmt(report.totalRevenue)}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          label="Outstanding"
          value={fmt(report.totalOutstandingAmount)}
          icon={AlertCircle}
          color="bg-amber-500"
        />
      </div>

      {/* Invoice sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <InvoiceSection
          title="Unpaid Invoices"
          invoices={report.unpaidInvoices}
          emptyLabel="No unpaid invoices — great job!"
        />
        <InvoiceSection
          title="Partially Paid"
          invoices={report.partiallyPaidInvoices}
          emptyLabel="No partially paid invoices."
        />
        <InvoiceSection
          title="Paid Invoices"
          invoices={report.paidInvoices}
          emptyLabel="No paid invoices yet."
        />
      </div>
    </div>
  );
}
