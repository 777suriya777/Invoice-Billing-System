import { calculateInvoiceAmounts } from '../utils/Math'
import { createInvoiceInRepo, getInvoiceByIdFromRepo, getInvoicesByUserFromRepo, updateInvoiceStatusInRepo } from '../repository/invoice-repository';
import { Request, Response } from 'express';
import { CreateInvoiceSchema } from '../validators/invoice.schema';
import { INVOICE_STATUS } from '../constants/invoiceStatus';

interface InvoiceItemInput {
    itemName: string;
    description?: string;
    unitPrice: number;
    quantity: number;
}

interface CreateInvoiceBody {
    clientName: string;
    clientAddress: string;
    items: InvoiceItemInput[];
    invoiceDate: string;
    dueDate: string;
}

// GET /invoices - return invoices belonging to the authenticated user
async function getInvoices(req: Request, res: Response): Promise<Response> {
  try{
    const userEmail = (req.user as any)?.email;
  if (!userEmail) {
    return res.status(401).json({ message: 'Unauthorized: missing user email' });
  }

  const invoices = await getInvoicesByUserFromRepo(userEmail);
  return res.json(invoices);
}
  catch(err){
    return res.status(500).json({message: (err as Error).message});
  }
}

// GET /invoices/:id - return the invoice only if it belongs to the authenticated user
async function getInvoice(req: Request, res: Response): Promise<void> {
  const invoiceId = parseInt(req.params.id as string);
  const userEmail = (req.user as any)?.email;
  if (!userEmail) {
    res.status(401).json({ message: 'Unauthorized: missing user email' });
    return;
  }
  const invoice = await getInvoiceByIdFromRepo(invoiceId, userEmail);
  if (!invoice) {
    res.status(404).json({ message: 'Invoice not found' });
    return;
  }
  res.json(invoice);
}

// POST /invoices - create an invoice tied to the authenticated user's email with server-side ID
async function createInvoice(req: Request, res: Response): Promise<Response> {
  const userEmail = (req.user as any)?.email;
  // Determine tax rate from env (DEFAULT_TAX_RATE) with a safe fallback to 7
  const envTaxRate = Number(process.env.DEFAULT_TAX_RATE);
  const taxRate = Number.isFinite(envTaxRate) ? envTaxRate : 7;

  if (!userEmail) {
    return res.status(401).json({ message: 'Unauthorized: missing user email' });
  }

  try {
    const parsed = CreateInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parsed.error.format() });
    }
    const body = parsed.data as CreateInvoiceBody;
    const { items, subTotal, taxAmount, total } = calculateInvoiceAmounts(body.items, taxRate);

    const newInvoice = {
      clientName: body.clientName,
      clientAddress: body.clientAddress,
      email: userEmail,
      items,
      taxRate,
      subTotal,
      taxAmount,
      totalAmount: total,
      invoiceDate: new Date(body.invoiceDate),
      dueDate: new Date(body.dueDate),
      status: INVOICE_STATUS.DRAFT,
      outStandingAmount: total,
      createdBy: userEmail
    };

    const createdInvoice = await createInvoiceInRepo(newInvoice);

    return res.status(201).json(createdInvoice);
  } catch (err) {
    const error = err as any;
    if (error && typeof error.message === 'string') {
      if (error.message === 'items_required') {
        return res.status(400).json({ message: 'At least one item is required to create an invoice' });
      }
      if (error.message.startsWith('invalid_')) {
        return res.status(400).json({ message: `Invalid item data: ${error.message}` });
      }
    }
    return res.status(400).json({ message: error.message || 'Error creating invoice' });
  }
}

async function changeStatus(req: Request, res: Response): Promise<Response> {
  try {
    const invoiceId = parseInt(req.params.id as string);
    const { status } = req.body;
    const userEmail = (req.user as any)?.email;

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

    return res.json(updatedInvoice);
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

function checkStatus(status: string): boolean {
  const validStatuses = Object.values(INVOICE_STATUS);
  return validStatuses.includes(status as any);
}

function validateStatusChange(currentStatus: string, newStatus: string): string | null {
  const statusTransitions: Record<string, string[]> = {
    [INVOICE_STATUS.DRAFT]: [INVOICE_STATUS.SENT, INVOICE_STATUS.CANCELLED],
    [INVOICE_STATUS.SENT]: [INVOICE_STATUS.PAID, INVOICE_STATUS.CANCELLED, INVOICE_STATUS.PARTIALLY_PAID],
    [INVOICE_STATUS.PAID]: [],
    [INVOICE_STATUS.CANCELLED]: [],
    [INVOICE_STATUS.PARTIALLY_PAID]: [INVOICE_STATUS.PAID, INVOICE_STATUS.CANCELLED]
  }

  const invalidStatusChange = !statusTransitions[currentStatus].includes(newStatus);
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
