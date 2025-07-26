 
import { PostResponse } from 'src/responses/post-response';
import { PostRepository } from '../../repositories/post';
import { UpdatePostDTO } from '../../schemas/post';

export class UpdatePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(id: number, data: UpdatePostDTO): Promise<PostResponse> {
    const existing = await this.postRepository.findById(id);
    if (!existing) throw new Error('Postagem não localizada.');

    const post = await this.postRepository.update(id, data);
    return {
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
    };
  }
}
