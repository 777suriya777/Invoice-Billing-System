export const INVOICE_STATUS = {
    DRAFT: 'Draft',
    PAID: 'Paid',
    SENT: 'Sent',
    CANCELLED: 'Cancelled',
    PARTIALLY_PAID: 'Partially Paid'
} as const;

export type InvoiceStatus = typeof INVOICE_STATUS[keyof typeof INVOICE_STATUS];