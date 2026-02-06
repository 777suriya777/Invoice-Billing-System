import { getInvoicesByUserFromRepo } from "../repository/invoice-repository";
import { Request, Response } from 'express';

async function getReport(req: Request, res: Response): Promise<void> {
    const userEmail = (req.user as any)?.email;

    if (!userEmail) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const invoices = await getInvoicesByUserFromRepo(userEmail);

    const unpaidInvoices = invoices.filter((inv: any) => inv.status === 'Sent');
    const paidInvoices = invoices.filter((inv: any) => inv.status === 'Paid');
    const partiallyPaidInvoices = invoices.filter((inv: any) => inv.status === 'Partially Paid');

    const billableInvoices = invoices.filter(inv =>
        inv.status !== 'Draft' && inv.status !== 'Cancelled'
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

    res.json({
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
