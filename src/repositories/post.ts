import { Prisma } from '@prisma/client';
import { Post } from '../domain/post';

export type PostWithAuthor = Prisma.PostGetPayload<{
  include: { author: { select: { id: true; name: true; email: true } } };
}>;

export type SearchOptions = {
  page?: number;
  limit?: number;
  includeDisabled?: boolean;
};

export type SearchResult = {
  items: PostWithAuthor[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export interface PostRepository {
  create(
    data: Omit<Post, 'id' | 'createdAt' | 'author' | 'disabled'>,
  ): Promise<Post>;
  findById(id: number): Promise<Post | null>;
  findMany(): Promise<Post[]>;
  update(
    id: number,
    data: Partial<Omit<Post, 'id' | 'createdAt' | 'author' | 'disabled'>>,
  ): Promise<Post>;
  delete(id: number): Promise<void>;
  search(term: string): Promise<Post[]>;
  searchOffset(term: string, opts?: SearchOptions): Promise<SearchResult>;
  disable(id: number): Promise<void>;
  enable(id: number): Promise<void>;
}
