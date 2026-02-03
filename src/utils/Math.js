// Utility: round to 2 decimal places (safe for currency)
function _roundTwo(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

// Calculate items amounts, subtotal, taxAmount and total. Throws Error when validation fails.
function calculateInvoiceAmounts(items, taxRate) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items_required');
  }

  const computedItems = items.map((item, index) => {
    const itemName = item.itemName || '';

    const unitPrice = Number(item.unitPrice);
    const quantity = Number(item.quantity);

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(`invalid_unitPrice:${itemCode}:${itemName}`);
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error(`invalid_quantity:${itemCode}:${itemName}`);
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