export interface CreatePostDTO {
  title: string;
  content: string;
  authorId: number;
}

export interface UpdatePostDTO {
  title?: string;
  content?: string;
}

export interface PostResponseDTO {
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
