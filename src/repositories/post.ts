import { Post } from '../domain/post';

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
  disable(id: number): Promise<void>;
  enable(id: number): Promise<void>;
}
