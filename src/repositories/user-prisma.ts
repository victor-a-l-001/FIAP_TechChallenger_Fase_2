import { PrismaClient, User, UserType } from '@prisma/client';
import { UserRepository } from './user';
import { CreateUserDTO, UpdateUserDTO } from '../schemas/user';

const prisma = new PrismaClient();

export class UserRepositoryPrisma implements UserRepository {

  async findTypeId(id: number): Promise<UserType | null> {
    return prisma.userType.findUnique({
      where: { id: id },
    });
  }
  
  async create(data: CreateUserDTO): Promise<User> {
    const { userTypeId, ...rest } = data;
    const createData: any = { ...rest };
    if (userTypeId !== undefined) {
      createData.userTypeId = userTypeId;
    }
    return prisma.user.create({
      data: createData,
      include: { userType: true },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email, disabled: false },
      include: { userType: true },
    });
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { userType: true },
    });
  }

  async findMany(): Promise<User[]> {
    return prisma.user.findMany({
      include: { userType: true },
    });
  }

  async update(id: number, data: UpdateUserDTO): Promise<User> {
    const { userTypeId, ...rest } = data;
    const updateData: any = { ...rest };
    if (userTypeId !== undefined) {
      updateData.userTypeId = userTypeId;
    }
    return prisma.user.update({
      where: { id },
      data: updateData,
      include: { userType: true },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}
