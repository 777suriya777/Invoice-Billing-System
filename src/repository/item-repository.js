import { prisma } from '../lib/prisma.ts';

export const createItemInRepo = async (data) => {
    return await prisma.item.create({
        data
    });
}

export const getItemsByUserFromRepo = async (email) => {
    return await prisma.item.findMany({
        where: { createdBy : email },
        orderBy : { createdAt: "desc" },
    });
}