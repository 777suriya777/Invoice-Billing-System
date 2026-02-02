import { prisma } from '../lib/prisma.ts';

export const createUser = async (data) => {
    return await prisma.user.create({ 
        data,
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true
        }
    });
}

export const getUserByEmail = async (email) => {
    return await prisma.user.findUnique({ 
        where: { email },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            password: true,
            isActive: true,
        }
    });
}

export const deleteUserByEmail = async (email) => {
    return await prisma.user.delete({ 
        where: { email },
        select: {
            id: true,
            email: true
        }
    });
}

export const updateUserPassword = async (email, newPassword) => {
    return await prisma.user.update({
        where: { email },
        data: { password: newPassword },
        select: {
            id: true,
            email: true
        }
    });
}

export const hasUserWithEmail = async (email) => {
    const user = await prisma.user.findUnique({ 
        where: { email },
        select: { id: true }
    });
    return !!user;
}

export const getPasswordHashByEmail = async (email) => {
    const user = await prisma.user.findUnique({ 
        where: { email },
        select: { 
            id: true,
            password: true,
            isActive: true 
        }
    });
    return user;
}