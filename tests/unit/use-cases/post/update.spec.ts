import { UpdatePostUseCase } from '../../../../src/use-cases/post/update';
import { PostRepository } from '../../../../src/repositories/post';
import { UpdatePostDTO } from '../../../../src/schemas/post';
import { PostResponseDTO } from '../../../../src/dtos/post-dto';

describe('UpdatePostUseCase', () => {
  let postRepo: Partial<PostRepository>;
  let useCase: UpdatePostUseCase;

  beforeEach(() => {
    postRepo = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    useCase = new UpdatePostUseCase(postRepo as PostRepository);
  });

  it('deve gerar um erro se o post não for encontrado', async () => {
    (postRepo.findById as jest.Mock).mockResolvedValue(null);
    const dto: UpdatePostDTO = { title: 'New', content: 'Content' };
    await expect(useCase.execute(1, dto)).rejects.toThrow(
      'Postagem não localizada.',
    );
    expect(postRepo.update).not.toHaveBeenCalled();
  });

  it('deve atualizar e retornar PostResponseDTO quando o post existir', async () => {
    const now = new Date();
    const existingPost: any = {
      id: 1,
      title: 'Titulo Antigo',
      content: 'Conteúdo Antigo',
      authorId: 5,
      author: { id: 5, name: 'professor', email: 'professor@nulo.com' },
      createdAt: now,
      updatedAt: now,
    };
    const updatedData: UpdatePostDTO = { title: 'Titulo', content: 'Conteúdo' };
    const updatedPost: any = {
      ...existingPost,
      title: updatedData.title,
      content: updatedData.content,
      updatedAt: new Date(now.getTime() + 1000),
    };

    (postRepo.findById as jest.Mock).mockResolvedValue(existingPost);
    (postRepo.update as jest.Mock).mockResolvedValue(updatedPost);

    const result = await useCase.execute(1, updatedData);

    expect(postRepo.findById).toHaveBeenCalledWith(1);
    expect(postRepo.update).toHaveBeenCalledWith(1, updatedData);
    expect(result).toEqual({
      id: updatedPost.id,
      title: updatedPost.title,
      content: updatedPost.content,
      authorId: updatedPost.authorId,
      author: {
        id: updatedPost.author.id,
        name: updatedPost.author.name,
        email: updatedPost.author.email,
      },
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt,
    } as PostResponseDTO);
  });
});
