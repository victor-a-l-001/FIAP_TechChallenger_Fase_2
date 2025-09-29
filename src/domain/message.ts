export interface Message {
  id: number;
  postId: number;
  userId: number;
  message: string;
  createdAt: Date; 
  user: { id: number; name: string; email: string };
}
