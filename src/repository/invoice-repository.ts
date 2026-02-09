import { prisma } from '../lib/prisma';

interface InvoiceItem {
    itemName: string;
    description?: string;
    unitPrice: number;
    quantity: number;
    amount: number;
}

interface CreateInvoiceData {
    clientName: string;
    clientAddress: string;
    email: string;
    items: InvoiceItem[];
    taxRate: number;
    subTotal: number;
    taxAmount: number;
    totalAmount: number;
    invoiceDate: Date;
    dueDate: Date;
    status: string;
    outStandingAmount: number;
    createdBy: string;
}

export const createInvoiceInRepo = async (data: CreateInvoiceData) => {
    const itemsToCreate = data.items.map((item: any) => ({
        itemName: item.itemName,
        description: item.description || '',
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        amount: item.amount
    }));

    return await prisma.invoice.create({
        data: {
            clientName: data.clientName,
            clientAddress: data.clientAddress,
            email: data.email,
            taxRate: data.taxRate,
            subTotal: data.subTotal,
            taxAmount: data.taxAmount,
            totalAmount: data.totalAmount,
            invoiceDate: data.invoiceDate,
            dueDate: data.dueDate,
            status: data.status,
            outStandingAmount: data.outStandingAmount,
            createdBy: data.createdBy,
            items: {
                create: itemsToCreate
            },
        },
        include: {
            items: true
        }
    });
}

export const getInvoicesByUserFromRepo = async (email: string, page = 1, pageSize = 10) => {
    const skip = (page - 1) * pageSize;
    const [data, total] = await prisma.$transaction([
        prisma.invoice.findMany({
            where: { email },
            include: {
                items: true,
                payments: true
            },
            skip,
            take: pageSize,
            orderBy: { createdAt: "desc" },
        }),
        prisma.invoice.count({ where: { email } })
    ]);

    return {
        data,
        pagination : {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    };
}

export const getInvoiceByIdFromRepo = async (id: number, email: string) => {
    return await prisma.invoice.findUnique({
        where: { id, email },
        include: {
            items: true,
            payments: true
        }
    });
}

export const updateInvoiceStatusInRepo = async (id: number, email: string, status: string) => {
    return await prisma.invoice.updateMany({
        where: { id, email },
        data: { status }
    });
}
