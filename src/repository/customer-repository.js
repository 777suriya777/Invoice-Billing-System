import { prisma } from "../lib/prisma.ts";

export const createCustomerInRepo = async (data) => {
  return await prisma.customer.create({
    data,
  });
};

export const getCustomerByEmailFromRepo = async (email) => {
  return await prisma.customer.findMany({
    where: { createdBy : email },
    orderBy : { createdAt: "desc" },
  });
}