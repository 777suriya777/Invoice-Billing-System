import { prisma } from '../lib/prisma';

interface CreateItemData {
    itemName: string;
    description: string;
    unitPrice: number;
    createdBy: string;
}

export const createItemInRepo = async (data: CreateItemData) => {
    return await prisma.item.create({
        data
    });
}

export const getItemsByUserFromRepo = async (email: string) => {
    return await prisma.item.findMany({
        where: { createdBy : email },
        orderBy : { createdAt: "desc" },
    });
}
