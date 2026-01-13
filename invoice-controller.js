const memoryStore = require('./memory-store');
const { v4: uuidv4 } = require('uuid');

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
  //Tax Rate is hadcoded temporarily
  const taxRate = 7;

  if (!userEmail) return res.status(401).json({ message: 'Unauthorized: missing user email' });

  //Validate the items array
  const {items = []} = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Invoice must contain at least one item' });
  }

  let subtotal = 0;

  for(let item of req.body.items){
    let {itemCode, itemName, description, category, unitPrice, quantity} = item;

    if(typeof unitPrice !== 'number' || unitPrice < 0){
        return res.status(400).json({ message: `Item ${itemCode} - ${itemName} has invalid unit price` });
    }

    if(typeof quantity !== 'number' || quantity <= 0){
        return res.status(400).json({ message: `Item ${itemCode} - ${itemName} has invalid quantity` });
    }

    //Amount calculation should be done server side
    //Per-Line Rounding Strategy
    item.amount = Math.round(unitPrice * quantity,2);

    subtotal += item.amount;
  }
  
  const taxAmount = Math.round(subtotal * (taxRate/100),2);
  const totalAmountWithTax = subtotal + taxAmount;

  //Basic template for invoice. Will be expanded later
  const newInvoice = {
    id: uuidv4(),
    email: userEmail,
    items: req.body.items || [],
    taxRate,
    taxAmount, 
    subtotal,
    totalAmount : totalAmountWithTax,
    status: 'Draft',
    createdAt: new Date().toISOString(),
  };

  const invoices = _getInvoicesArray();
  invoices.push(newInvoice);
  memoryStore.set('invoices', invoices);

  res.status(201).json(newInvoice);
}

module.exports = {
  getInvoices,
  getInvoice,
  createInvoice
};