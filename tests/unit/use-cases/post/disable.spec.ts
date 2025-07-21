import { DisablePostUseCase } from '../../../../src/use-cases/post/disable';
import { PostRepository } from '../../../../src/repositories/post';

describe('DisablePostUseCase', () => {
  let postRepo: Partial<PostRepository>;
  let useCase: DisablePostUseCase;

  beforeEach(() => {
    postRepo = {
      findById: jest.fn(),
      disable: jest.fn(),
    };
    useCase = new DisablePostUseCase(postRepo as PostRepository);
  });

  it('lança erro quando a postagem não é localizada', async () => {
    (postRepo.findById as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(42)).rejects.toThrow(
      'Postagem não localizada.',
    );

    expect(postRepo.disable).not.toHaveBeenCalled();
  });

  it('não chama disable se a postagem já estiver desabilitada', async () => {
    (postRepo.findById as jest.Mock).mockResolvedValue({
      id: 99,
      author: { id: 1, name: 'Nome', email: 'professor@teste.com' },
      authorId: 1,
      title: 'Título',
      content: 'Conteúdo',
      disabled: true,           // já desabilitado
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(useCase.execute(7)).resolves.toBeUndefined();

    expect(postRepo.disable).not.toHaveBeenCalled();
  });

  it('chama disable quando a postagem está habilitada', async () => {
    (postRepo.findById as jest.Mock).mockResolvedValue({
      id: 99,
      author: { id: 1, name: 'Nome', email: 'professor@teste.com' },
      authorId: 1,
      title: 'Título',
      content: 'Conteúdo',
      disabled: false,          // habilitado
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(useCase.execute(99)).resolves.toBeUndefined();

    expect(postRepo.disable).toHaveBeenCalledTimes(1);
    expect(postRepo.disable).toHaveBeenCalledWith(99);
  });
});
