export interface Post {
  id: number;
  title: string;
  content: string;
  description: string;
  authorId: number;
  createdAt: Date;
  disabled: boolean;
  updatedAt?: Date | null;
  author: { id: number; name: string; email: string };
}
