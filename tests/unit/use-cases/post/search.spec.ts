import { SearchPostsUseCase } from '../../../../src/use-cases/post/search';
import { PostRepository } from '../../../../src/repositories/post';
import { PostResponseDTO } from '../../../../src/dtos/post-dto';
import { Roles } from '../../../../src/types/roles';

describe('SearchPostsUseCase', () => {
  let postRepo: Partial<PostRepository>;
  let useCase: SearchPostsUseCase;

  const now = new Date();
  const fakePosts: any[] = [
    {
      id: 1,
      title: 'Ativo',
      content: 'Conteúdo ativo.',
      authorId: 5,
      author: { id: 5, name: 'Autor Ativo', email: 'ativo@nulo.com' },
      createdAt: now,
      updatedAt: now,
      disabled: false,
    },
    {
      id: 2,
      title: 'Desabilitado',
      content: 'Não deveria aparecer para aluno.',
      authorId: 6,
      author: { id: 6, name: 'Autor Inativo', email: 'inativo@nulo.com' },
      createdAt: now,
      updatedAt: now,
      disabled: true,
    },
  ];

  beforeEach(() => {
    postRepo = { search: jest.fn() };
    useCase = new SearchPostsUseCase(postRepo as PostRepository);
  });

  it('deve retornar array vazio quando não houver correspondência, independentemente do perfil', async () => {
    (postRepo.search as jest.Mock).mockResolvedValue([]);

    const resultAluno = await useCase.execute('qualquer', Roles.Aluno);
    const resultAgente = await useCase.execute('qualquer', Roles.Professor);

    expect(postRepo.search).toHaveBeenCalledWith('qualquer');
    expect(resultAluno).toEqual([]);
    expect(resultAgente).toEqual([]);
  });

  it('deve filtrar posts desabilitados para perfil Aluno', async () => {
    (postRepo.search as jest.Mock).mockResolvedValue(fakePosts);

    const result = await useCase.execute('termo', Roles.Aluno);

    // Esperamos apenas o post com disabled: false
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: fakePosts[0].id,
      title: fakePosts[0].title,
      content: fakePosts[0].content,
      authorId: fakePosts[0].authorId,
      disabled: fakePosts[0].disabled,
      author: {
        id: fakePosts[0].author.id,
        name: fakePosts[0].author.name,
        email: fakePosts[0].author.email,
      },
      createdAt: fakePosts[0].createdAt,
      updatedAt: fakePosts[0].updatedAt,
    } as PostResponseDTO);
  });

  it('não deve filtrar posts desabilitados para perfil Agente', async () => {
    (postRepo.search as jest.Mock).mockResolvedValue(fakePosts);

    const result = await useCase.execute('termo', Roles.Professor);

    // Esperamos ambos os posts, independente do disabled
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      fakePosts.map(post => ({
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
      } as PostResponseDTO))
    );
  });

  it('sempre chama postRepository.search com o termo correto', async () => {
    (postRepo.search as jest.Mock).mockResolvedValue(fakePosts);

    await useCase.execute('busca', Roles.Aluno);
    await useCase.execute('busca', Roles.Professor);

    expect(postRepo.search).toHaveBeenNthCalledWith(1, 'busca');
    expect(postRepo.search).toHaveBeenNthCalledWith(2, 'busca');
  });
});
