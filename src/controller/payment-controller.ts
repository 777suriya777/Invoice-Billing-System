import { createPaymetnInRepo, getPaymentsByInvoiceIdFromRepo } from '../repository/payment-repository';
import { _roundTwo } from '../utils/Math';
import { Request, Response } from 'express';
import { MakePaymentSchema } from '../validators/payment.schema';

interface MakePaymentBody {
    amount: number;
    paymentMethod: string;
}

async function makePaymentForAnInvoice(req: Request, res: Response): Promise<Response> {
    const userEmail = (req.user as any)?.email;
    const invoiceId = parseInt(req.params.id as string);
    const validation = MakePaymentSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ message: 'Validation failed', errors: validation.error.format() });
    }
    const { amount, paymentMethod } = validation.data as MakePaymentBody;

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

        return res.status(200).json({ message: 'Payment successful', invoice });
    } catch (err) {
        const error = err as any;
        return res.status(400).json({ message: error.message });
    }
}

async function getPaymentForAnInvoice(req: Request, res: Response): Promise<Response> {
    const invoiceId = parseInt(req.params.id as string);
    const userEmail = (req.user as any)?.email;

    if (!userEmail) {
        return res.status(401).json({ message: 'Unauthorized: missing user email' })
    }

    const payments = await getPaymentsByInvoiceIdFromRepo(invoiceId, userEmail);

    if (!payments || payments.length === 0) {
        return res.status(404).json({ message: 'No Payment found' });
    }

    return res.status(200).json({ payments });
}

export {
    makePaymentForAnInvoice,
    getPaymentForAnInvoice
};
