import { calculateInvoiceAmounts } from '../utils/Math.js'
import { createInvoiceInRepo, getInvoiceByIdFromRepo, getInvoicesByUserFromRepo, updateInvoiceStatusInRepo } from '../repository/invoice-repository.js';
// GET /invoices - return invoices belonging to the authenticated user
async function getInvoices(req, res) {
  const userEmail = req.user && req.user.email;
  if (!userEmail) return res.status(401).json({ message: 'Unauthorized: missing user email' });

  const invoices = await getInvoicesByUserFromRepo(userEmail);
  res.json(invoices);
}

// GET /invoices/:id - return the invoice only if it belongs to the authenticated user
async function getInvoice(req, res) {
  const invoiceId = parseInt(req.params.id);
  const userEmail = req.user && req.user.email;
  if (!userEmail) return res.status(401).json({ message: 'Unauthorized: missing user email' });
  const invoice = await getInvoiceByIdFromRepo(invoiceId, userEmail);
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
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
    const { items, subTotal, taxAmount, total } = calculateInvoiceAmounts(req.body.items, taxRate);

    const newInvoice = {
      clientName: req.body.clientName,
      clientAddress: req.body.clientAddress,
      email: userEmail,
      items,
      taxRate,
      subTotal,
      taxAmount,
      totalAmount: total,
      invoiceDate: new Date(req.body.invoiceDate),
      dueDate: new Date(req.body.dueDate),
      status: 'Draft',
      outStandingAmount: total,
      createdBy: userEmail
      //payments : [],
    };

    const createdInvoice = await createInvoiceInRepo(newInvoice);

    return res.status(201).json(createdInvoice);
  } catch (err) {
    if (err && typeof err.message === 'string') {
      if (err.message === 'items_required') return res.status(400).json({ message: 'At least one item is required to create an invoice' });
      if (err.message.startsWith('invalid_')) return res.status(400).json({ message: `Invalid item data: ${err.message}` });
    }
    return res.status(400).json({ message: err.message || 'Error creating invoice' });
  }
}

async function changeStatus(req, res) {
  try {
    const invoiceId = parseInt(req.params.id);
    const { status } = req.body;
    const userEmail = req.user && req.user.email;

    if (!userEmail) {
      return res.status(401).json({ message: 'Unauthorized: missing user email' });
    }

    if (!checkStatus(status)) {
      return res.status(400).json({ message: `Invalid status value: ${status}` });
    }

    const updatedInvoice = await updateInvoiceStatusInRepo(
      invoiceId, 
      userEmail, 
      status
    );

    if (!updatedInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(updatedInvoice);
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

function checkStatus(status) {
  const validStatuses = ['Draft', 'Sent', 'Paid', 'Cancelled', 'Partially Paid'];
  return validStatuses.includes(status);
}

function validateStatusChange(currentStatus, newStatus) {
  let statusTransitions = {
    "Draft": ["Sent", "Cancelled"],
    "Sent": ["Paid", "Cancelled", "Partially Paid"],
    "Paid": [],
    "Cancelled": [],
    "Partially Paid": ["Paid", "Cancelled"]
  }

  let invalidStatusChange = !statusTransitions[currentStatus].includes(newStatus);
  if (currentStatus === newStatus) {
    return `Invoice is already in '${currentStatus}' status`;
  }

  if (invalidStatusChange) {
    return `Invalid status change from '${currentStatus}' to '${newStatus}'`;
  }

  return null;
}

export {
  getInvoices,
  getInvoice,
  createInvoice,
  changeStatus
};