import { getInvoicesByUserFromRepo } from "../repository/invoice-repository";

async function getReport(req, res) {
    const userEmail = req.user?.email;

    if (!userEmail) return res.status(401).json({ message: 'Unauthorized' });

    const invoices = await getInvoicesByUserFromRepo(userEmail);

    const unpaidInvoices = invoices.filter((inv) => inv.status === 'Sent');
    const paidInvoices = invoices.filter((inv) => inv.status === 'Paid');
    const partiallyPaidInvoices = invoices.filter((inv) => inv.status === 'Partially Paid');

    const billableInvoices = invoices.filter(inv =>
        inv.status !== 'Draft' && inv.status !== 'Cancelled'
    );

    const totalAmountBilled = billableInvoices.reduce((sum, inv) => {
        return sum + Number(inv.totalAmount || 0);
    }, 0);

    const totalRevenue = invoices.reduce((sum, inv) => {
        const paymentTotal = (inv.payments || []).reduce((pSum, p) => pSum + Number(p.amount || 0), 0);
        return sum + paymentTotal;
    }, 0);

    const totalOutstandingAmount = invoices.reduce((sum, inv) => {
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