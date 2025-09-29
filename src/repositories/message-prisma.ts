import { Prisma, PrismaClient } from '@prisma/client';
import { MessageRepository } from './message';
import { Message } from '../domain/message';

const prisma = new PrismaClient();
export const includeAuthor = Prisma.validator<Prisma.PostMessageInclude>()({
  user: { select: { id: true, name: true, email: true } },
});

export class MessageRepositoryPrisma implements MessageRepository {
  create(data: Omit<Message, 'id' | 'createdAt' | 'user'>): Promise<Message> {
    return prisma.postMessage.create({
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  findListByPostId(id: number): Promise<Message[]> {
    return prisma.postMessage.findMany({
      where: {
        postId: id,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }
}
