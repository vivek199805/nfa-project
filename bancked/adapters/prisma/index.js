import prisma, { connectPrisma, disconnectPrisma } from "../../config/prisma.js";

export const prismaAdapter = prisma;

export const connect = connectPrisma;

export const disconnect = disconnectPrisma;

export default prismaAdapter;
