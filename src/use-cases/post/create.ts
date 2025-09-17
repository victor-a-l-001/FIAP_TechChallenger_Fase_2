import { Roles } from '../../types/roles';
import { PostRepository } from '../../repositories/post';
import { UserRepository } from '../../repositories/user';
import { CreatePostDTO } from '../../schemas/post';
import { PostResponse } from 'src/responses/post-response';

export class CreatePostUseCase {
  constructor(
    private postRepository: PostRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(data: CreatePostDTO, email: string): Promise<PostResponse> {
    const author = await this.userRepository.findByEmail(email);

    if (!author) throw new Error('Professor não encontrado.');

    if (author.userTypeId != Roles.Professor)
      throw new Error('Professor Inválido.');

    const post = await this.postRepository.create({
      authorId: author.id,
      content: data.content,
      title: data.title,
      description: data.description,
    });

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      disabled: post.disabled,
      description: post.description,
      author: {
        id: author.id,
        name: author.name,
        email: author.email,
      },
      createdAt: post.createdAt,
    };
  }
}
