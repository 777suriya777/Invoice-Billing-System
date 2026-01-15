const memoryStore = require('../memory-store.js');

function getReport(req, res) {
    const userEmail = req.user && req.user.email;

    if (!userEmail) return res.status(401).json({ message: 'Unauthorized: missing user email' });

    const invoices = memoryStore.get('invoices') || [];
    const userInvoices = invoices.filter(inv => inv.email === userEmail);

    const unpaidInvoices = userInvoices.filter((inv) => inv.status === 'Sent');
    const paidInvoices = userInvoices.filter((inv) => inv.status === 'Paid');
    const partiallyPaidInvoices = userInvoices.filter((inv) => inv.status === 'Partially Paid');

    const totalInvoices = userInvoices.length;

    const totalAmountBilled = userInvoices.filter(inv => ['Sent', 'Partially Paid','Paid'].includes(inv.status))
                                            .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    const totalRevenue = userInvoices.reduce((sum, inv) => {
        const payments = inv.payments || [];
        return sum + payments.reduce((pSum, p) => pSum + (p.amount || 0), 0);
    }, 0);

    const totalOutstandingAmount = userInvoices.reduce((sum, inv) => sum + (inv.outstandingAmount || 0), 0);

    const report = {
        totalInvoices,
        unpaidInvoices,
        paidInvoices,
        partiallyPaidInvoices,
        totalAmountBilled,
        totalRevenue,
        totalOutstandingAmount
    };

    res.json(report);
}

module.exports = { getReport };