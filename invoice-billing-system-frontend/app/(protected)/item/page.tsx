'use client';

import { useState, useEffect } from 'react';
import authFetch from '@/lib/authFetch';
import { useRouter } from 'next/navigation';
import { Package, Plus, AlertCircle, Loader2, Tag } from 'lucide-react';

interface Item {
  id?: string | number;
  itemName: string;
  description: string;
  unitPrice: number;
  isActive?: boolean;
}

export default function ItemListPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchItems() {
      try {
        setError('');
        setLoading(true);
        const response = await authFetch('http://localhost:3000/items', { method: 'GET' });
        const data = await response.json();
        setItems(data);
      } catch (err: unknown) {
        setError((err as Error).message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500">Loading items…</p>
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
          <h1 className="text-2xl font-bold text-slate-900">Items</h1>
          <p className="text-sm text-slate-500 mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your catalog
          </p>
        </div>
        <button
          onClick={() => router.push('/item/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Package size={22} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">No items yet</p>
            <p className="text-xs text-slate-400">Add your first item to include it in invoices.</p>
            <button
              onClick={() => router.push('/item/new')}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus size={15} />
              Add Item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">
                    Item Name
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">
                    Description
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">
                    Unit Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package size={14} className="text-violet-600" />
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{item.itemName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500 line-clamp-1 max-w-xs">
                        {item.description || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Tag size={12} className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-900">
                          ₹{Number(item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
