import { createPaymetnInRepo, getPaymentsByInvoiceIdFromRepo } from '../repository/payment-repository';
import { _roundTwo } from '../utils/Math';
import { Request, Response } from 'express';

interface MakePaymentBody {
    amount: number;
    paymentMethod: string;
}

async function makePaymentForAnInvoice(req: Request, res: Response): Promise<void> {
    const userEmail = (req.user as any)?.email;
    const invoiceId = parseInt(req.params.id as string);
    const { amount, paymentMethod } = req.body as MakePaymentBody;

    if (!userEmail) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
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
        const error = err as any;
        res.status(400).json({ message: error.message });
    }
}

async function getPaymentForAnInvoice(req: Request, res: Response): Promise<void> {
    const invoiceId = parseInt(req.params.id as string);
    const userEmail = (req.user as any)?.email;

    if (!userEmail) {
        res.status(401).json({ message: 'Unauthorized: missing user email' });
        return;
    }

    const payments = await getPaymentsByInvoiceIdFromRepo(invoiceId, userEmail);

    if (!payments || payments.length === 0) {
        res.status(404).json({ message: 'No Payment found' });
        return;
    }

    res.status(200).json({ payments });
}

export {
    makePaymentForAnInvoice,
    getPaymentForAnInvoice
};
