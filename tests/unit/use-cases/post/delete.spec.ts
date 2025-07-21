import { DeletePostUseCase } from '../../../../src/use-cases/post/delete';
import { PostRepository } from '../../../../src/repositories/post';

describe('DeletePostUseCase', () => {
  let postRepo: Partial<PostRepository>;
  let useCase: DeletePostUseCase;

  beforeEach(() => {
    postRepo = {
      findById: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeletePostUseCase(postRepo as PostRepository);
  });

  it('deve lançar erro se o post não for encontrado', async () => {
    (postRepo.findById as jest.Mock).mockResolvedValue(null);

    // Aqui: usa `toThrow`, não `toThrowError`
    await expect(useCase.execute(1)).rejects.toThrow(
      'Postagem não localizada.',
    );

    expect(postRepo.delete).not.toHaveBeenCalled();
    expect(postRepo.findById).toHaveBeenCalledWith(1);
  });

  it('deve chamar delete quando encontrar o post', async () => {
    const fakePost = {
      id: 1,
      title: 'Título',
      content: 'Conteúdo',
      authorId: 1,
      createdAt: new Date(),
    };

    (postRepo.findById as jest.Mock).mockResolvedValue(fakePost);

    await useCase.execute(1);

    expect(postRepo.findById).toHaveBeenCalledWith(1);
    expect(postRepo.delete).toHaveBeenCalledWith(1);
  });
});
