import { PrismaClient, User, UserType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const plainPassword = 'senha-correspondente';

export function getPass() {
  return plainPassword;
}

export async function createUser(): Promise<User> {
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  return prisma.user.create({
    data: {
      email: `${Date.now()}@nulo.com`,
      password: hashedPassword,
      name: 'Nome',
      userTypeId: 1,
    },
  });
}

export async function createType(): Promise<UserType> {
  return prisma.userType.create({
    data: {
      description: 'Descrição',
      name: 'Nome',
      createdAt: new Date(),
    },
  });
}
