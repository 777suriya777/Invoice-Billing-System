const memoryStore = require('../../memory-store');
const { v4: uuidv4 } = require('uuid');
const {calculateInvoiceAmounts} = require('../utils/Math.js')

// Helper to initialize and return the invoices array in memory store
function _getInvoicesArray() {
  let invoices = memoryStore.get('invoices');
  if (!Array.isArray(invoices)) {
    invoices = [];
    memoryStore.set('invoices', invoices);
  }
  return invoices;
}

// GET /invoices - return invoices belonging to the authenticated user
async function getInvoices(req, res) {
  const userEmail = req.user && req.user.email;
  if (!userEmail) return res.status(401).json({ message: 'Unauthorized: missing user email' });

  const invoices = _getInvoicesArray().filter(inv => inv.email === userEmail);
  res.json(invoices);
}

// GET /invoices/:id - return the invoice only if it belongs to the authenticated user
async function getInvoice(req, res) {
  const invoiceId = req.params.id;
  const invoices = _getInvoicesArray();
  const invoice = invoices.find(inv => String(inv.id) === String(invoiceId));

  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

  const userEmail = req.user && req.user.email;
  if (!userEmail || invoice.email !== userEmail) {
    return res.status(403).json({ message: 'Forbidden: access denied' });
  }

  res.json(invoice);
}

// POST /invoices - create an invoice tied to the authenticated user's email with server-side ID
async function createInvoice(req, res) {
  const userEmail = req.user && req.user.email;
  // Determine tax rate from env (DEFAULT_TAX_RATE) with a safe fallback to 7
  const envTaxRate = Number(process.env.DEFAULT_TAX_RATE);
  const taxRate = Number.isFinite(envTaxRate) ? envTaxRate : 7;

  if (!userEmail) return res.status(401).json({ message: 'Unauthorized: missing user email' });

  try {
    const { items, subtotal, taxAmount, total } = calculateInvoiceAmounts(req.body.items, taxRate);

    const newInvoice = {
      id: uuidv4(),
      email: userEmail,
      items,
      taxRate,
      subtotal,
      taxAmount,
      totalAmount: total,
      status: 'Draft',
      createdAt: new Date().toISOString(),
    };

    const invoices = _getInvoicesArray();
    invoices.push(newInvoice);
    memoryStore.set('invoices', invoices);

    res.status(201).json(newInvoice);
  } catch (err) {
    if (err && typeof err.message === 'string') {
      if (err.message === 'items_required') return res.status(400).json({ message: 'At least one item is required to create an invoice' });
      if (err.message.startsWith('invalid_')) return res.status(400).json({ message: `Invalid item data: ${err.message}` });
    }
    return res.status(400).json({ message: 'Invalid request data' });
  }
}

// PUT /invoices/:id - update invoice line items and recalculate amounts; must be owner
async function updateInvoice(req, res) {
  const userEmail = req.user && req.user.email;
  if (!userEmail) return res.status(401).json({ message: 'Unauthorized: missing user email' });

  const invoiceId = req.params.id;
  const invoices = _getInvoicesArray();
  const idx = invoices.findIndex(inv => String(inv.id) === String(invoiceId));

  if (idx === -1) return res.status(404).json({ message: 'Invoice not found' });

  const invoice = invoices[idx];
  if (invoice.email !== userEmail) return res.status(403).json({ message: 'Forbidden: access denied' });

  const invoiceStatus = invoice.status;
  if (invoiceStatus === 'Paid' || invoiceStatus === 'Cancelled' || invoiceStatus === 'Sent') {
    return res.status(400).json({ message: `Cannot update an invoice with status '${invoiceStatus}'` });
  }

  // Determine tax rate: prefer invoice-specific rate, then environment default, then fallback to 7
  const envTaxRate = Number(process.env.DEFAULT_TAX_RATE);
  const invoiceTaxRate = Number.isFinite(Number(invoice.taxRate)) ? Number(invoice.taxRate) : undefined;
  const taxRate = invoiceTaxRate !== undefined ? invoiceTaxRate : (Number.isFinite(envTaxRate) ? envTaxRate : 7);

  try {
    const { items, subtotal, taxAmount, total } = calculateInvoiceAmounts(req.body.items, taxRate);

    invoice.items = items;
    invoice.subtotal = subtotal;
    invoice.taxAmount = taxAmount;
    invoice.totalAmount = total;
    invoice.updatedAt = new Date().toISOString();

    invoices[idx] = invoice;
    memoryStore.set('invoices', invoices);

    res.json(invoice);
  } catch (err) {
    if (err && typeof err.message === 'string') {
      if (err.message === 'items_required') return res.status(400).json({ message: 'At least one item is required to update the invoice' });
      if (err.message.startsWith('invalid_')) return res.status(400).json({ message: `Invalid item data: ${err.message}` });
    }
    return res.status(400).json({ message: 'Invalid request data' });
  }
}

async function changeStatus(req, res) {
  const invoiceId = req.params.id;
  const { status } = req.body;
  const userEmail = req.user && req.user.email;

  if (!userEmail) return res.status(401).json({ message: 'Unauthorized: missing user email' });

  const invoices = _getInvoicesArray();
  const invoiceIndex = invoices.findIndex(inv => String(inv.id) === String(invoiceId));

  if (invoiceIndex === -1) return res.status(404).json({ message: 'Invoice not found' });

  if (invoices[invoiceIndex].email !== userEmail) {
    return res.status(403).json({ message: 'Forbidden: access denied' });
  }

  if(!checkStatus(status)){
    return res.status(400).json({ message: `Invalid status value: ${status}` });
  }

  let validationError = validateStatusChange(invoices[invoiceIndex].status, status);

  if(validationError){
    return res.status(400).json({ message: validationError });
  }

  invoices[invoiceIndex].status = status;
  invoices[invoiceIndex].updatedAt = new Date().toISOString();
  
  memoryStore.set('invoices', invoices);

  res.json(invoices[invoiceIndex]);
}

function checkStatus(status){
    const validStatuses = ['Draft', 'Sent', 'Paid', 'Cancelled'];
    return validStatuses.includes(status);
}

function validateStatusChange(currentStatus, newStatus){
    let statusTransitions = {
        "Draft": ["Sent", "Cancelled"],
        "Sent": ["Paid", "Cancelled"],
        "Paid": [],
        "Cancelled": []
    }

    let invalidStatusChange = !statusTransitions[currentStatus].includes(newStatus);
    if(currentStatus === newStatus){
        return `Invoice is already in '${currentStatus}' status`;
    }

    if(invalidStatusChange){
        return `Invalid status change from '${currentStatus}' to '${newStatus}'`;
    }

    return null;
}

module.exports = {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  changeStatus
};