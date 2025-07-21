import { EnablePostUseCase } from '../../../../src/use-cases/post/enable';
import { PostRepository } from '../../../../src/repositories/post';

describe('EnablePostUseCase', () => {
  let postRepo: Partial<PostRepository>;
  let useCase: EnablePostUseCase;

  beforeEach(() => {
    postRepo = {
      findById: jest.fn(),
      enable: jest.fn(),
    };
    useCase = new EnablePostUseCase(postRepo as PostRepository);
  });

  it('lança erro quando a postagem não é localizada', async () => {
    (postRepo.findById as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(123)).rejects.toThrow(
      'Postagem não localizada.',
    );

    expect(postRepo.enable).not.toHaveBeenCalled();
  });

  it('não chama enable se a postagem já estiver habilitada', async () => {
    (postRepo.findById as jest.Mock).mockResolvedValue({
      id: 99,
      author: { id: 1, name: 'Nome', email: 'professor@teste.com' },
      authorId: 1,
      title: 'Título',
      content: 'Conteúdo',
      disabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(useCase.execute(45)).resolves.toBeUndefined();

    expect(postRepo.enable).not.toHaveBeenCalled();
  });

  it('chama enable quando a postagem está desabilitada', async () => {
    (postRepo.findById as jest.Mock).mockResolvedValue({
      id: 77,
      author: { id: 1, name: 'Nome', email: 'professor@teste.com' },
      authorId: 1,
      title: 'Título',
      content: 'Conteúdo',
      disabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(useCase.execute(77)).resolves.toBeUndefined();

    expect(postRepo.enable).toHaveBeenCalledTimes(1);
    expect(postRepo.enable).toHaveBeenCalledWith(77);
  });
});
