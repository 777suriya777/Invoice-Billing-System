'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authFetch from '@/lib/authFetch';
import { ComboBox } from '@/app/components/ComboBox';
import { ArrowLeft, Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';

type InvoiceItem = {
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

interface Customer {
  name: string;
  address: string;
  email: string;
  isActive: boolean;
}

interface Item {
  itemName: string;
  description: string;
  unitPrice: number;
  isActive: boolean;
}

function InputField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-white';

export default function NewInvoicePage() {
  const router = useRouter();
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [error, setError] = useState('');
  const [itemError, setItemError] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);
  const [itemOptions, setItemOptions] = useState<Item[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);

  const grandTotal = lineItems
    .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    .toFixed(2);

  useEffect(() => {
    async function fetchData() {
      setCustomersLoading(true);
      setItemsLoading(true);
      try {
        const [cRes, iRes] = await Promise.all([
          authFetch('http://localhost:3000/customers', { method: 'GET' }),
          authFetch('http://localhost:3000/items', { method: 'GET' }),
        ]);
        setCustomerOptions(await cRes.json().catch(() => []));
        setItemOptions(await iRes.json().catch(() => []));
      } catch {
        // non-fatal — user can still type manually
      } finally {
        setCustomersLoading(false);
        setItemsLoading(false);
      }
    }
    fetchData();
  }, []);

  function handleAddLineItem() {
    if (!itemName.trim() || !description.trim() || quantity <= 0 || unitPrice <= 0) {
      setItemError('Please fill all item fields with valid values.');
      return;
    }
    setItemError('');
    setLineItems((prev) => [...prev, { itemName, description, quantity, unitPrice }]);
    setItemName('');
    setDescription('');
    setQuantity(1);
    setUnitPrice(0);
  }

  async function handleSubmit() {
    if (!clientName.trim()) { setError('Please select or enter a client name.'); return; }
    if (!invoiceDate) { setError('Please select an invoice date.'); return; }
    if (!dueDate) { setError('Please select a due date.'); return; }
    if (lineItems.length === 0) { setError('Add at least one line item before creating the invoice.'); return; }

    try {
      setError('');
      setLoading(true);
      const response = await authFetch('http://localhost:3000/invoices', {
        method: 'POST',
        body: JSON.stringify({ clientName, clientAddress, invoiceDate, dueDate, items: lineItems }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to create invoice');
      }
      router.push('/invoices');
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="h-4 w-px bg-slate-300" />
        <h1 className="text-2xl font-bold text-slate-900">New Invoice</h1>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl max-w-2xl">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Invoice header */}
        <div className="xl:col-span-1 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">
              Client Information
            </h2>

            <InputField label="Client Name" required>
              <ComboBox
                value={clientName}
                onChange={setClientName}
                onSelect={(c: Customer) => {
                  setClientName(c.name);
                  setClientAddress(c.address);
                }}
                options={customerOptions}
                placeholder="Search or type client name"
                isLoading={customersLoading}
                getOptionLabel={(c) => c.name}
                renderOption={(c) => (
                  <div>
                    <p className="font-medium text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{c.address}</p>
                  </div>
                )}
              />
            </InputField>

            <InputField label="Client Address">
              <textarea
                rows={3}
                placeholder="123 Main St, City, State"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </InputField>

            <InputField label="Invoice Date" required>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className={inputClass}
              />
            </InputField>

            <InputField label="Due Date" required>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
            </InputField>
          </div>
        </div>

        {/* Right: Line items */}
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Line Items</h2>
            </div>

            {/* Items table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Item', 'Description', 'Qty', 'Unit Price', 'Total', ''].map((h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {lineItems.map((item, index) => (
                    <tr key={index} className="group">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.itemName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 max-w-[160px] truncate">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-slate-800">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-slate-800">
                        ₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setLineItems((prev) => prev.filter((_, i) => i !== index))}
                          className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Add item row */}
                  <tr className="border-t border-dashed border-slate-200 bg-slate-50/50">
                    <td className="px-4 py-3">
                      <ComboBox
                        value={itemName}
                        onChange={setItemName}
                        onSelect={(item: Item) => {
                          setItemName(item.itemName);
                          setDescription(item.description);
                          setUnitPrice(item.unitPrice);
                        }}
                        options={itemOptions}
                        placeholder="Select item"
                        isLoading={itemsLoading}
                        getOptionLabel={(i) => i.itemName}
                        renderOption={(i) => (
                          <div>
                            <p className="font-medium text-slate-800">{i.itemName}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              ₹{i.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        )}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={inputClass}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        placeholder="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className={`${inputClass} w-20`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                        className={`${inputClass} w-28`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-700">
                        ₹{(quantity * unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={handleAddLineItem}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        <Plus size={13} />
                        Add
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {itemError && (
              <div className="mx-6 mb-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-700">{itemError}</p>
              </div>
            )}

            {/* Grand total */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Grand Total</span>
              <span className="text-xl font-bold text-slate-900">
                ₹{Number(grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || lineItems.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Creating…
                </>
              ) : (
                'Create Invoice'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
