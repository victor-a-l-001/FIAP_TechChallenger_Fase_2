import { Roles } from '../../types/roles';
import { PostResponseDTO } from '../../dtos/post-dto';
import { PostRepository } from '../../repositories/post';
import { UserRepository } from '../../repositories/user';
import { CreatePostDTO } from '../../schemas/post';

export class CreatePostUseCase {
  constructor(
    private postRepository: PostRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(data: CreatePostDTO): Promise<PostResponseDTO> {
    const author = await this.userRepository.findById(data.authorId);

    if (!author) throw new Error('Professor não encontrado.');

    if (author.userTypeId != Roles.Professor)
      throw new Error('Professor Inválido.');

    const post = await this.postRepository.create(data);
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      disabled: post.disabled,
      author: {
        id: author.id,
        name: author.name,
        email: author.email,
      },
      createdAt: post.createdAt,
    };
  }
}
