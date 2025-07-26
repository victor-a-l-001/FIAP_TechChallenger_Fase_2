import { GetAllPostsUseCase } from '../../../../src/use-cases/post/get-all';
import { PostRepository } from '../../../../src/repositories/post';
import { PostResponse } from '../../../../src/responses/post-response';
import { Roles } from '../../../../src/types/roles';

describe('GetAllPostsUseCase', () => {
  let postRepo: Partial<PostRepository>;
  let useCase: GetAllPostsUseCase;
  const now = new Date();

  const postsSample: any[] = [
    {
      id: 1,
      title: 'Ativo',
      content: 'Conteúdo ativo.',
      authorId: 10,
      author: { id: 10, name: 'Autor 1', email: 'a1@teste.com' },
      createdAt: now,
      updatedAt: now,
      disabled: false,
    },
    {
      id: 2,
      title: 'Desabilitado',
      content: 'Conteúdo restrito.',
      authorId: 20,
      author: { id: 20, name: 'Autor 2', email: 'a2@teste.com' },
      createdAt: now,
      updatedAt: now,
      disabled: true,
    },
  ];

  beforeEach(() => {
    postRepo = { findMany: jest.fn() };
    useCase = new GetAllPostsUseCase(postRepo as PostRepository);
  });

  it('deve retornar array vazio se não houver posts (Aluno)', async () => {
    (postRepo.findMany as jest.Mock).mockResolvedValue([]);
    const result = await useCase.execute(Roles.Aluno);
    expect(postRepo.findMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it('deve retornar array vazio se não houver posts (Professor)', async () => {
    (postRepo.findMany as jest.Mock).mockResolvedValue([]);
    const result = await useCase.execute(Roles.Professor);
    expect(postRepo.findMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it('deve filtrar posts desabilitados para perfil Aluno', async () => {
    (postRepo.findMany as jest.Mock).mockResolvedValue(postsSample);

    const result = await useCase.execute(Roles.Aluno);

    // Apenas o primeiro post (disabled: false) deve aparecer
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: postsSample[0].id,
      title: postsSample[0].title,
      content: postsSample[0].content,
      authorId: postsSample[0].authorId,
      disabled: postsSample[0].disabled,
      author: {
        id: postsSample[0].author.id,
        name: postsSample[0].author.name,
        email: postsSample[0].author.email,
      },
      createdAt: postsSample[0].createdAt,
      updatedAt: postsSample[0].updatedAt,
    } as PostResponse);
    expect(postRepo.findMany).toHaveBeenCalledTimes(1);
  });

  it('não deve filtrar posts desabilitados para perfil Professor', async () => {
    (postRepo.findMany as jest.Mock).mockResolvedValue(postsSample);

    const result = await useCase.execute(Roles.Professor);

    // Ambos os posts devem aparecer
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      postsSample.map(
        (post) =>
          ({
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
          }) as PostResponse,
      ),
    );
    expect(postRepo.findMany).toHaveBeenCalledTimes(1);
  });

  it('sempre chama postRepository.findMany apenas uma vez por execução', async () => {
    (postRepo.findMany as jest.Mock).mockResolvedValue(postsSample);

    await useCase.execute(Roles.Aluno);
    await useCase.execute(Roles.Professor);

    expect(postRepo.findMany).toHaveBeenCalledTimes(2);
  });
});
