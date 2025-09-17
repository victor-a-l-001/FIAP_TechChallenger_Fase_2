import { Roles } from '../../types/roles';
import { PostRepository, PostWithAuthor } from '../../repositories/post';

export type SearchPostsInput = {
  term: string;
  userType: number;
  page?: number;
  limit?: number;
};

export type PostResponse = {
  id: PostWithAuthor['id'];
  title: PostWithAuthor['title'];
  content: PostWithAuthor['content'];
  description: PostWithAuthor['description'];
  authorId: PostWithAuthor['authorId'];
  disabled: PostWithAuthor['disabled'];
  author: {
    id: PostWithAuthor['author']['id'];
    name: PostWithAuthor['author']['name'];
    email: PostWithAuthor['author']['email'];
  };
  createdAt: PostWithAuthor['createdAt'];
  updatedAt: PostWithAuthor['updatedAt'];
};

export type SearchPostsOutput = {
  items: PostResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export class SearchPostsUseCase {
  constructor(private repo: PostRepository) {}

  async execute(input: SearchPostsInput): Promise<SearchPostsOutput> {
    const isAluno = input.userType === Roles.Aluno;

    const result = await this.repo.searchOffset(input.term, {
      page: input.page,
      limit: input.limit,
      includeDisabled: !isAluno,
    });

    return {
      ...result,
      items: result.items.map<PostResponse>((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        description: post.description,
        authorId: post.authorId,
        disabled: post.disabled,
        author: {
          id: post.author.id,
          name: post.author.name,
          email: post.author.email,
        },
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })),
    };
  }
}
