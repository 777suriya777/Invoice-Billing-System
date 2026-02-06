import { prisma } from '../lib/prisma';

interface CreateUserData {
    firstName: string;
    lastName: string | null;
    email: string;
    password: string;
}

interface UserSelect {
    id: true;
    email: true;
    firstName: true;
    lastName: true;
    isActive: true;
}

interface PasswordHashResult {
    id: string;
    password: string;
    isActive: boolean;
}

export const createUser = async (data: CreateUserData) => {
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

export const getUserByEmail = async (email: string) => {
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

export const deleteUserByEmail = async (email: string) => {
    return await prisma.user.delete({ 
        where: { email },
        select: {
            id: true,
            email: true
        }
    });
}

export const updateUserPassword = async (email: string, newPassword: string) => {
    return await prisma.user.update({
        where: { email },
        data: { password: newPassword },
        select: {
            id: true,
            email: true
        }
    });
}

export const hasUserWithEmail = async (email: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({ 
        where: { email },
        select: { id: true }
    });
    return !!user;
}

export const getPasswordHashByEmail = async (email: string) => {
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
