import { createPaymetnInRepo, getPaymentsByInvoiceIdFromRepo } from '../repository/payment-repository.js';
import { _roundTwo } from '../utils/Math.js';

async function makePaymentForAnInvoice(req, res) {
    const userEmail = req.user?.email;
    const invoiceId = parseInt(req.params.id);
    const { amount, paymentMethod } = req.body;

    if (!userEmail) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const invoice = await createPaymetnInRepo({
            invoiceId,
            amount,
            paymentMethod,
            createdBy: userEmail,
        });

        res.status(200).json({ message: 'Payment successful', invoice });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function getPaymentForAnInvoice(req, res) {
    const invoiceId = parseInt(req.params.id);
    const userEmail = req.user && req.user.email;

    if (!userEmail) return res.status(401).json({ message: 'Unauthorized: missing user email' });

    const payments = await getPaymentsByInvoiceIdFromRepo(invoiceId, userEmail);

    if (!payments || payments.length === 0) return res.status(404).json({ message: 'No Payment found' });

    return res.status(200).json({ payments });
}

export {
    makePaymentForAnInvoice,
    getPaymentForAnInvoice
};