import { prisma } from '../lib/prisma.ts';

export const createPaymetnInRepo = async ({ invoiceId, paymentMethod, amount, createdBy }) => {
    return await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findFirst({ where: { id: invoiceId } });
        if (!invoice) {
            throw new Error('Invoice not found');
        }

        if (invoice.status === 'Paid') {
            throw new Error('Invoice already paid');
        }

        const newOutstandingAmount = invoice.outStandingAmount - amount;

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
                status: newOutstandingAmount === 0 ? 'Paid' : 'Partially Paid',
            },
        });

        return tx.invoice.findUnique({
            where: { id: invoiceId },
            include: { items: true, payments: true },
        });
    });
}

export const getPaymentsByInvoiceIdFromRepo = async (invoiceId, userEmail) => {
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