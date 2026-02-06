// Utility: round to 2 decimal places (safe for currency)
function _roundTwo(value: number): number {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

interface InvoiceItem {
  itemName: string;
  description?: string;
  unitPrice: number | string;
  quantity: number | string;
}

interface ComputedInvoiceItem extends InvoiceItem {
  amount: number;
  unitPrice: number;
  quantity: number;
}

interface InvoiceAmounts {
  items: ComputedInvoiceItem[];
  subTotal: number;
  taxAmount: number;
  total: number;
}

// Calculate items amounts, subtotal, taxAmount and total. Throws Error when validation fails.
function calculateInvoiceAmounts(items: InvoiceItem[], taxRate: number): InvoiceAmounts {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items_required');
  }

  const computedItems: ComputedInvoiceItem[] = items.map((item, index) => {
    const itemName = item.itemName || '';

    const unitPrice = Number(item.unitPrice);
    const quantity = Number(item.quantity);

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(`invalid_unitPrice:${itemName}`);
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error(`invalid_quantity:${itemName}`);
    }

    const amount = _roundTwo(unitPrice * quantity);

    return {
      ...item,
      unitPrice: _roundTwo(unitPrice),
      quantity,
      amount
    };
  });

  const subTotal = _roundTwo(computedItems.reduce((s, it) => s + it.amount, 0));
  const taxAmount = _roundTwo(subTotal * (taxRate / 100));
  const total = _roundTwo(subTotal + taxAmount);

  return {
    items: computedItems,
    subTotal,
    taxAmount,
    total
  };
}

export { _roundTwo, calculateInvoiceAmounts };
