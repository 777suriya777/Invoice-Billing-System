import { prisma } from '../lib/prisma';
import { INVOICE_STATUS } from '../constants/invoiceStatus';

interface CreatePaymentData {
    invoiceId: number;
    paymentMethod: string;
    amount: number;
    createdBy: string;
}

export const createPaymetnInRepo = async ({ invoiceId, paymentMethod, amount, createdBy }: CreatePaymentData) => {
    return await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findFirst({ where: { id: invoiceId } });
        if (!invoice) {
            throw new Error('Invoice not found');
        }

        if (invoice.status === INVOICE_STATUS.PAID) {
            throw new Error('Invoice already paid');
        }

        const newOutstandingAmount = Number(invoice.outStandingAmount) - amount;

        if (newOutstandingAmount < 0) {
            throw new Error('Overpayment is not allowed');
        }

        await tx.payment.create({
            data: {
                invoiceId,
                paymentMethod,
                amount,
                createdBy
            },
        });

        await tx.invoice.update({
            where: { id: invoiceId },
            data: {
                outStandingAmount: newOutstandingAmount,
                status: newOutstandingAmount === 0 ? INVOICE_STATUS.PAID : INVOICE_STATUS.PARTIALLY_PAID,
            },
        });

        return tx.invoice.findUnique({
            where: { id: invoiceId },
            include: { items: true, payments: true },
        });
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
