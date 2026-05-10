'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import authFetch from '@/lib/authFetch';
import Badge from '@/app/components/Badge';
import {
  ArrowLeft,
  Send,
  CreditCard,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Calendar,
  User,
  MapPin,
  Clock,
} from 'lucide-react';

interface PaymentRecord {
  amount: number;
  method: string;
  createdBy: string;
  createdAt: string;
}

interface InvoiceDetail {
  id: string | number;
  clientName: string;
  clientAddress: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  totalAmount: number;
  outStandingAmount: number;
  subTotal?: number;
  taxAmount?: number;
  items: {
    itemName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  payments: PaymentRecord[];
}

const inputClass =
  'w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-white';

const fmt = (n: number) =>
  `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function InvoiceDetailsPage() {
  const params = useParams();
  const invoiceId = params.id;
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  async function fetchInvoice() {
    try {
      setLoading(true);
      setError('');
      const response = await authFetch(`http://localhost:3000/invoices/${invoiceId}`, {
        method: 'GET',
      });
      const data = await response.json();
      setInvoice(data);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (invoiceId) fetchInvoice();
  }, [invoiceId]);

  async function sendInvoice() {
    try {
      setError('');
      setActionLoading(true);
      const response = await authFetch(`http://localhost:3000/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Sent' }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to send invoice');
      }
      await fetchInvoice();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  }

  async function makePayment() {
    setValidationError('');
    const amount = parseFloat(paymentAmount);
    if (!paymentMethod) { setValidationError('Please select a payment method.'); return; }
    if (!amount || amount <= 0) { setValidationError('Please enter a valid payment amount.'); return; }
    if (invoice && amount > invoice.outStandingAmount) {
      setValidationError(`Amount cannot exceed the outstanding balance of ${fmt(invoice.outStandingAmount)}.`);
      return;
    }

    try {
      setActionLoading(true);
      const response = await authFetch(`http://localhost:3000/payments/${invoiceId}`, {
        method: 'POST',
        body: JSON.stringify({ amount, paymentMethod }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Payment failed');
      }
      setPaymentAmount('');
      setPaymentMethod('');
      setPaymentSuccess(true);
      await fetchInvoice();
      setTimeout(() => setPaymentSuccess(false), 3000);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500">Loading invoice…</p>
        </div>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 rounded-xl max-w-md">
        <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!invoice) return null;

  const canSend = invoice.status === 'Draft';
  const canPay = invoice.status === 'Sent' || invoice.status === 'Partially Paid';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              Invoice #{String(invoice.id).padStart(4, '0')}
            </h1>
            <Badge status={invoice.status} />
          </div>
        </div>

        {canSend && (
          <button
            onClick={sendInvoice}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            Send Invoice
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl max-w-2xl">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="xl:col-span-1 space-y-5">
          {/* Client info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">
              Client Information
            </h2>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-indigo-700">
                  {invoice.clientName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{invoice.clientName}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{invoice.clientAddress}</p>
              </div>
            </div>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar size={13} className="flex-shrink-0" />
                <span>
                  Issued <span className="font-medium text-slate-700">{invoice.invoiceDate}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock size={13} className="flex-shrink-0" />
                <span>
                  Due <span className="font-medium text-slate-700">{invoice.dueDate}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-4">
              Summary
            </h2>
            <div className="space-y-2.5">
              {invoice.subTotal !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-700">{fmt(invoice.subTotal)}</span>
                </div>
              )}
              {invoice.taxAmount !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax</span>
                  <span className="text-slate-700">{fmt(invoice.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="font-bold text-slate-900">{fmt(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Outstanding</span>
                <span
                  className={`font-semibold ${
                    invoice.outStandingAmount > 0 ? 'text-amber-600' : 'text-green-600'
                  }`}
                >
                  {fmt(invoice.outStandingAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment form */}
          {canPay && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <CreditCard size={16} className="text-indigo-500" />
                <h2 className="text-sm font-semibold text-slate-800">Record Payment</h2>
              </div>

              {validationError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{validationError}</p>
                </div>
              )}

              {paymentSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl mb-4">
                  <CheckCircle2 size={14} className="text-green-600" />
                  <p className="text-xs text-green-700 font-medium">Payment recorded successfully!</p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Amount (max {fmt(invoice.outStandingAmount)})
                  </label>
                  <input
                    type="number"
                    min={0.01}
                    step="0.01"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select method</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={makePayment}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  {actionLoading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}
                  Record Payment
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right column: line items + payment history */}
        <div className="xl:col-span-2 space-y-5">
          {/* Line items */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Line Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Item', 'Description', 'Qty', 'Unit Price', 'Amount'].map((h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(invoice.items || []).map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.itemName}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{item.description}</td>
                      <td className="px-6 py-4 text-sm text-slate-800">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-slate-800">{fmt(item.unitPrice)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {fmt(item.amount || item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50">
                    <td colSpan={4} className="px-6 py-3.5 text-right text-sm font-semibold text-slate-700">
                      Total
                    </td>
                    <td className="px-6 py-3.5 text-sm font-bold text-slate-900">
                      {fmt(invoice.totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment history */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">Payment History</h2>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {invoice.payments.length} {invoice.payments.length === 1 ? 'payment' : 'payments'}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Amount', 'Method', 'Recorded By', 'Date'].map((h) => (
                        <th
                          key={h}
                          className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {invoice.payments.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-semibold text-green-700">{fmt(p.amount)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                            <CreditCard size={11} />
                            {p.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{p.createdBy}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(p.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
