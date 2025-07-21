import { Roles } from '../../types/roles';
import { PostResponseDTO } from '../../dtos/post-dto';
import { PostRepository } from '../../repositories/post';

export class SearchPostsUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(term: string, userType: number): Promise<PostResponseDTO[]> {
    const aluno: boolean = userType == Roles.Aluno;
    let posts = await this.postRepository.search(term);

    if (posts.length > 0 && aluno) {
      posts = posts.filter((w) => w.disabled === false);
    }

    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      disabled: post.disabled,
      author: {
        id: post.author.id,
        name: post.author.name,
        email: post.author.email,
      },
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));
  }
}
