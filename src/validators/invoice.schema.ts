import {z} from 'zod';

export const InvoiceItemSchema = z.object({
    itemName : z.string(),
    description : z.string(),
    unitPrice : z.number().positive(),
    quantity : z.number().int().positive(),
});

export const CreateInvoiceSchema = z.object({
    clientName : z.string().min(2, 'Client Name is required'),
    clientAddress : z.string().min(5, 'Client Address is required'),
    // email is set server-side from authenticated user, so do not require it from client
    items : z.array(InvoiceItemSchema).min(1, 'At least one item is required'),
    invoiceDate : z.string(),
    dueDate : z.string(),
});