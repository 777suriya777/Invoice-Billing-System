import { getInvoicesByUserFromRepo } from "../repository/invoice-repository";
import { Request, Response } from 'express';import { INVOICE_STATUS } from '../constants/invoiceStatus';
async function getReport(req: Request, res: Response): Promise<Response> {
    const userEmail = (req.user as any)?.email;

    if (!userEmail) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const invoices = await getInvoicesByUserFromRepo(userEmail);

    const unpaidInvoices = invoices.filter((inv: any) => inv.status === INVOICE_STATUS.SENT);
    const paidInvoices = invoices.filter((inv: any) => inv.status === INVOICE_STATUS.PAID);
    const partiallyPaidInvoices = invoices.filter((inv: any) => inv.status === INVOICE_STATUS.PARTIALLY_PAID);

    const billableInvoices = invoices.filter(inv =>
        inv.status !== INVOICE_STATUS.DRAFT && inv.status !== INVOICE_STATUS.CANCELLED
    );

    const totalAmountBilled = billableInvoices.reduce((sum: number, inv: any) => {
        return sum + Number(inv.totalAmount || 0);
    }, 0);

    const totalRevenue = invoices.reduce((sum: number, inv: any) => {
        const paymentTotal = (inv.payments || []).reduce((pSum: number, p: any) => pSum + Number(p.amount || 0), 0);
        return sum + paymentTotal;
    }, 0);

    const totalOutstandingAmount = invoices.reduce((sum: number, inv: any) => {
        return sum + Number(inv.outStandingAmount || 0);
    }, 0);

    return res.json({
        totalInvoices: invoices.length,
        unpaidInvoices,
        paidInvoices,
        partiallyPaidInvoices,
        totalAmountBilled,
        totalRevenue,
        totalOutstandingAmount
    });
}

export { getReport };
