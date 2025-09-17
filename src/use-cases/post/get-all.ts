import { Roles } from '../../types/roles'; 
import { PostRepository } from '../../repositories/post'; 
import { PostResponse } from 'src/responses/post-response';

export class GetAllPostsUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(userType: number): Promise<PostResponse[]> {
    var aluno: boolean = userType == Roles.Aluno;
    var response: PostResponse[] = [];

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
        description: item.description,
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
