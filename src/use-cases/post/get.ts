import { Roles } from '../../types/roles'; 
import { PostRepository } from '../../repositories/post'; 
import { PostResponse } from 'src/responses/post-response';

export class GetPostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(id: number, userType: number): Promise<PostResponse> {
    var aluno: boolean = userType == Roles.Aluno;

    let post = await this.postRepository.findById(id);
    if (!post) throw new Error('Postagem não localizada.');

    if (aluno && post.disabled) throw new Error('Postagem não localizada.');

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      disabled: post.disabled,
      description: post.description,
      author: {
        id: post.author.id,
        name: post.author.name,
        email: post.author.email,
      },
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}
