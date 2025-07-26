import { CreatePostUseCase } from '../../../../src/use-cases/post/create';
import { PostRepository } from '../../../../src/repositories/post';
import { UserRepository } from '../../../../src/repositories/user';
import { Roles } from '../../../../src/types/roles';
import { CreatePostDTO } from '../../../../src/schemas/post';
import { PostResponse } from '../../../../src/responses/post-response';

describe('CreatePostUseCase', () => {
  let postRepo: Partial<PostRepository>;
  let userRepo: Partial<UserRepository>;
  let useCase: CreatePostUseCase;

  const now = new Date();
  const createDto: CreatePostDTO = {
    title: 'Título de Teste',
    content: 'Conteúdo de Teste',
    authorId: 1,
  };

  beforeEach(() => {
    postRepo = { create: jest.fn() };
    userRepo = { findById: jest.fn() };
    useCase = new CreatePostUseCase(
      postRepo as PostRepository,
      userRepo as UserRepository,
    );
  });

  it('lança erro se o professor não for encontrado', async () => {
    (userRepo.findById as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(createDto))
      .rejects
      .toThrow('Professor não encontrado.');

    expect(userRepo.findById).toHaveBeenCalledWith(createDto.authorId);
    expect(postRepo.create).not.toHaveBeenCalled();
  });

  it('lança erro se o usuário não for professor', async () => {
    (userRepo.findById as jest.Mock).mockResolvedValue({
      id: 2,
      name: 'Aluno X',
      email: 'aluno@teste.com',
      userTypeId: Roles.Aluno,
    });

    await expect(useCase.execute(createDto))
      .rejects
      .toThrow('Professor Inválido.');

    expect(userRepo.findById).toHaveBeenCalledWith(createDto.authorId);
    expect(postRepo.create).not.toHaveBeenCalled();
  });

  it('deve criar o post e retornar o DTO de resposta adequado', async () => {
    // mock usuário válido (Professor)
    const fakeAuthor = {
      id: 1,
      name: 'Professor Y',
      email: 'professor@teste.com',
      userTypeId: Roles.Professor,
    };
    (userRepo.findById as jest.Mock).mockResolvedValue(fakeAuthor);

    // mock retorno do repositório de posts
    const fakePost: any = {
      id: 10,
      title: createDto.title,
      content: createDto.content,
      authorId: createDto.authorId,
      disabled: false,
      createdAt: now,
      // updatedAt não é retornado pelo use-case e, portanto, não faz parte do DTO
    };
    (postRepo.create as jest.Mock).mockResolvedValue(fakePost);

    const result = await useCase.execute(createDto);

    expect(userRepo.findById).toHaveBeenCalledWith(createDto.authorId);
    expect(postRepo.create).toHaveBeenCalledWith(createDto);
    expect(result).toEqual({
      id: fakePost.id,
      title: fakePost.title,
      content: fakePost.content,
      authorId: fakePost.authorId,
      disabled: fakePost.disabled,
      author: {
        id: fakeAuthor.id,
        name: fakeAuthor.name,
        email: fakeAuthor.email,
      },
      createdAt: fakePost.createdAt,
    } as PostResponse);
  });
});
