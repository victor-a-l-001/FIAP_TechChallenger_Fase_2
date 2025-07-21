import { PrismaClient } from '@prisma/client';
import { PostRepository } from './post';
import { Post } from '../domain/post';

const prisma = new PrismaClient();

export class PostRepositoryPrisma implements PostRepository {
  async create(
    data: Omit<Post, 'id' | 'createdAt' | 'author' | 'disabled'>,
  ): Promise<Post> {
    return prisma.post.create({
      data,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findById(id: number): Promise<Post | null> {
    return await prisma.post.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async findMany(): Promise<Post[]> {
    return await prisma.post.findMany({
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async update(
    id: number,
    data: Partial<Omit<Post, 'id' | 'createdAt' | 'author' | 'disabled'>>,
  ): Promise<Post> {
    return await prisma.post.update({
      where: { id },
      data,
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async disable(id: number): Promise<void> {
    await prisma.post.update({
      where: { id },
      data: { disabled: true },
    });
  }

  async enable(id: number): Promise<void> {
    await prisma.post.update({
      where: { id },
      data: { disabled: false },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.post.delete({ where: { id } });
  }

  async search(term: string): Promise<Post[]> {
    return await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { content: { contains: term, mode: 'insensitive' } },
        ],
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }
}
