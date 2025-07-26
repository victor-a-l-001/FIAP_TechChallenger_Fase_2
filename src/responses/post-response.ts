export interface PostResponse {
  id: number;
  title: string;
  content: string;
  authorId: number;
  author: {
    id: number;
    name: string;
    email: string;
  };
  disabled: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
}