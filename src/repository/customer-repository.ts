import { prisma } from "../lib/prisma";

interface CreateCustomerData {
    name: string;
    address: string;
    email: string;
    createdBy: string;
}

export const createCustomerInRepo = async (data: CreateCustomerData) => {
  return await prisma.customer.create({
    data,
  });
};

export const getCustomerByEmailFromRepo = async (email: string) => {
  return await prisma.customer.findMany({
    where: { createdBy : email },
    orderBy : { createdAt: "desc" },
  });
}
