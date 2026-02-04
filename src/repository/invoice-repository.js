import { prisma } from '../lib/prisma.ts';

export const createInvoiceInRepo = async (data) => {
    return await prisma.invoice.create({
        data : {
            ...data,
            items : {
                create : data.items
            },
        },
        include: {
            items: true
        }
    });
}

export const getInvoicesByUserFromRepo = async (email) => {
    return await prisma.invoice.findMany({
        where: { email },
        orderBy : { createdAt: "desc" },
        include: {
            items: true,
            payments: true
        }
    });
}

export const getInvoiceByIdFromRepo = async (id, email) => {
    return await prisma.invoice.findUnique({
        where: { id, email },
        include: {
            items: true
        }
    });
}

export const updateInvoiceStatusInRepo = async(id, email, status) => {
    return await prisma.invoice.updateMany({
        where : { id, email },
        data : { status }
    });
}