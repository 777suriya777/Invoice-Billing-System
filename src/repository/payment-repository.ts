import { prisma } from '../lib/prisma';
import { INVOICE_STATUS } from '../constants/invoiceStatus';
import { Prisma } from '../generated/prisma/client';

interface CreatePaymentData {
    invoiceId: number;
    paymentMethod: string;
    amount: number;
    createdBy: string;
}

export const createPaymetnInRepo = async ({ invoiceId, paymentMethod, amount, createdBy }: CreatePaymentData) => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Query both ID and email (createdBy) to prevent IDOR
        const invoice = await tx.invoice.findUnique({
            where: { id: invoiceId, email: createdBy }
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        if (invoice.status === INVOICE_STATUS.PAID) {
            throw new Error('Invoice already paid');
        }

        if (invoice.status === INVOICE_STATUS.CANCELLED) {
            throw new Error('Cannot make a payment on a cancelled invoice');
        }

        // We use Prisma's atomic decrement, but first we need to ensure the amount won't be < 0
        if (Number(invoice.outStandingAmount) < amount) {
            throw new Error('Overpayment is not allowed');
        }

        const newPayment = await tx.payment.create({
            data: {
                invoiceId,
                paymentMethod,
                amount,
                createdBy
            },
        });

        const updatedInvoice = await tx.invoice.update({
            where: { id: invoiceId },
            data: {
                outStandingAmount: { decrement: amount }
            },
            include: { items: true, payments: true }
        });

        // Determine the new status based on the atomically updated outStandingAmount
        const newStatus = Number(updatedInvoice.outStandingAmount) <= 0
            ? INVOICE_STATUS.PAID
            : INVOICE_STATUS.PARTIALLY_PAID;

        if (updatedInvoice.status !== newStatus) {
            return await tx.invoice.update({
                where: { id: invoiceId },
                data: { status: newStatus },
                include: { items: true, payments: true }
            });
        }

        return updatedInvoice;
    });
}

export const getPaymentsByInvoiceIdFromRepo = async (invoiceId: number, userEmail: string) => {
    const payments = await prisma.payment.findMany({
        where: {
            invoiceId,
            invoice: {
                email: userEmail
            }
        },
        orderBy: { paymentDate: 'desc' }
    });
    return payments;
}
