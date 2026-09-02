import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function connectSQL(): Promise<void> {
  await prisma.$connect();
  console.log("PostgreSQL connecté");
}

export async function disconnectSQL(): Promise<void> {
  await prisma.$disconnect();
}

export default prisma;
