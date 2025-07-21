import { Roles } from '../../types/roles';
import { PostResponseDTO } from '../../dtos/post-dto';
import { PostRepository } from '../../repositories/post';

export class GetAllPostsUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(userType: number): Promise<PostResponseDTO[]> {
    var aluno: boolean = userType == Roles.Aluno;
    var response: PostResponseDTO[] = [];

    let posts = await this.postRepository.findMany();

    if (posts.length > 0 && aluno) {
      posts = posts.filter((w) => w.disabled === false);
    }

    posts.forEach((item) => {
      response.push({
        id: item.id,
        title: item.title,
        authorId: item.authorId,
        content: item.content,
        updatedAt: item.updatedAt,
        createdAt: item.createdAt,
        disabled: item.disabled,
        author: {
          id: item.author.id,
          name: item.author.name,
          email: item.author.email,
        },
      });
    });

    return response;
  }
}
