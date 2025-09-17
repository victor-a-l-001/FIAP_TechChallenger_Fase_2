import { Prisma, PrismaClient } from '@prisma/client';
import { PostRepository, SearchOptions, SearchResult } from './post';
import { Post } from '../domain/post';

const prisma = new PrismaClient();
export const includeAuthor = Prisma.validator<Prisma.PostInclude>()({
  author: { select: { id: true, name: true, email: true } },
});

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

  async searchOffset(
    term: string,
    opts: SearchOptions = {},
  ): Promise<SearchResult> {
    const limit = Math.min(Math.max(opts.limit ?? 20, 1), 100);
    const page = Math.max(opts.page ?? 1, 1);
    const skip = (page - 1) * limit;

    const baseWhere: Prisma.PostWhereInput = {
      OR: [
        { title: { contains: term, mode: 'insensitive' } },
        { content: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ],
      ...(opts.includeDisabled ? {} : { disabled: false }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.post.findMany({
        where: baseWhere,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take: limit,
        include: includeAuthor,
      }),
      prisma.post.count({ where: baseWhere }),
    ]);

    const totalPages = Math.ceil(total / limit); // se total=0 => 0 páginas
    const hasPrev = page > 1;
    const hasNext = totalPages > 0 && page < totalPages;

    return {
      items,
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    };
  }
}
