import { GetPostUseCase } from '../../../../src/use-cases/post/get';
import { PostRepository } from '../../../../src/repositories/post';
import { PostResponseDTO } from '../../../../src/dtos/post-dto';
import { Roles } from '../../../../src/types/roles';

describe('GetPostUseCase', () => {
  let postRepo: Partial<PostRepository>;
  let useCase: GetPostUseCase;
  const now = new Date();

  const enabledPost: any = {
    id: 1,
    title: 'Post Ativo',
    content: 'Conteúdo visível a todos.',
    authorId: 2,
    author: { id: 2, name: 'Autor', email: 'autor@nulo.com' },
    createdAt: now,
    updatedAt: now,
    disabled: false,
  };

  const disabledPost: any = {
    id: 2,
    title: 'Post Desabilitado',
    content: 'Conteúdo restrito.',
    authorId: 3,
    author: { id: 3, name: 'Outro Autor', email: 'outro@nulo.com' },
    createdAt: now,
    updatedAt: now,
    disabled: true,
  };

  beforeEach(() => {
    postRepo = { findById: jest.fn() };
    useCase = new GetPostUseCase(postRepo as PostRepository);
  });

  it('deve gerar erro se o post não for encontrado', async () => {
    (postRepo.findById as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(999, Roles.Aluno))
      .rejects
      .toThrow('Postagem não localizada.');

    expect(postRepo.findById).toHaveBeenCalledWith(999);
  });

  it('deve gerar erro para Aluno quando o post estiver desabilitado', async () => {
    (postRepo.findById as jest.Mock).mockResolvedValue(disabledPost);

    await expect(useCase.execute(2, Roles.Aluno))
      .rejects
      .toThrow('Postagem não localizada.');

    expect(postRepo.findById).toHaveBeenCalledWith(2);
  });

  it('deve retornar PostResponseDTO para Aluno quando o post estiver habilitado', async () => {
    (postRepo.findById as jest.Mock).mockResolvedValue(enabledPost);

    const result = await useCase.execute(1, Roles.Aluno);

    expect(postRepo.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      id: enabledPost.id,
      title: enabledPost.title,
      content: enabledPost.content,
      authorId: enabledPost.authorId,
      disabled: enabledPost.disabled,
      author: {
        id: enabledPost.author.id,
        name: enabledPost.author.name,
        email: enabledPost.author.email,
      },
      createdAt: enabledPost.createdAt,
      updatedAt: enabledPost.updatedAt,
    } as PostResponseDTO);
  });

  it('deve retornar PostResponseDTO para Professor mesmo quando o post estiver desabilitado', async () => {
    (postRepo.findById as jest.Mock).mockResolvedValue(disabledPost);

    const result = await useCase.execute(2, Roles.Professor);

    expect(postRepo.findById).toHaveBeenCalledWith(2);
    expect(result).toEqual({
      id: disabledPost.id,
      title: disabledPost.title,
      content: disabledPost.content,
      authorId: disabledPost.authorId,
      disabled: disabledPost.disabled,
      author: {
        id: disabledPost.author.id,
        name: disabledPost.author.name,
        email: disabledPost.author.email,
      },
      createdAt: disabledPost.createdAt,
      updatedAt: disabledPost.updatedAt,
    } as PostResponseDTO);
  });
});
