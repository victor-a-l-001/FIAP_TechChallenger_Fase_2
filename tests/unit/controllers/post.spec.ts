import { Request, Response } from 'express';
import { PostController } from '../../../src/controllers/post';
import { JwtPayload } from '../../../src/types/express';
import { PostRepositoryPrisma } from '../../../src/repositories/post-prisma';
import { UserRepositoryPrisma } from '../../../src/repositories/user-prisma';
import { Roles } from '../../../src/types/roles';

jest.mock('../../../src/config', () => ({
  config: { jwt: { secret: 'secret', expiresIn: '1h' } },
}));

describe('PostController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let sendMock: jest.Mock;

  let createSpy: jest.SpyInstance;
  let findManySpy: jest.SpyInstance;
  let findByIdSpy: jest.SpyInstance;
  let updateSpy: jest.SpyInstance;
  let deleteSpy: jest.SpyInstance;
  let disableSpy: jest.SpyInstance;
  let enableSpy: jest.SpyInstance;
  let searchSpy: jest.SpyInstance;
  let userFindByIdSpy: jest.SpyInstance;

  const now = new Date();
  const fakePost = {
    id: 1,
    title: 'T',
    content: 'C',
    authorId: 7,
    disabled: false,
    createdAt: now,
    updatedAt: now,
    author: { id: 7, name: 'N', email: 'e@e.com' },
  };

  beforeAll(() => {
    createSpy = jest.spyOn(PostRepositoryPrisma.prototype, 'create');
    findManySpy = jest.spyOn(PostRepositoryPrisma.prototype, 'findMany');
    findByIdSpy = jest.spyOn(PostRepositoryPrisma.prototype, 'findById');
    updateSpy = jest.spyOn(PostRepositoryPrisma.prototype, 'update');
    deleteSpy = jest.spyOn(PostRepositoryPrisma.prototype, 'delete');
    disableSpy = jest.spyOn(PostRepositoryPrisma.prototype, 'disable');
    enableSpy = jest.spyOn(PostRepositoryPrisma.prototype, 'enable');
    searchSpy = jest.spyOn(PostRepositoryPrisma.prototype, 'search');
    userFindByIdSpy = jest.spyOn(UserRepositoryPrisma.prototype, 'findById');
  });

  beforeEach(() => {
    jest.clearAllMocks();

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    sendMock = jest.fn().mockReturnThis();

    createSpy.mockReset();
    findManySpy.mockReset();
    findByIdSpy.mockReset();
    updateSpy.mockReset();
    deleteSpy.mockReset();
    disableSpy.mockReset();
    enableSpy.mockReset();
    searchSpy.mockReset();
    userFindByIdSpy.mockReset();

    res = { status: statusMock, json: jsonMock, send: sendMock };
    req = { params: {}, query: {}, body: {} };
  });

  describe('create', () => {
    it('201 e body quando sucesso', async () => {
      req.body = { title: 'T', content: 'C', authorId: 7 };
      userFindByIdSpy.mockResolvedValue({
        id: 7,
        name: 'N',
        email: 'e@e.com',
        userTypeId: Roles.Professor,
      });
      createSpy.mockResolvedValue(fakePost);

      await PostController.create(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          title: 'T',
          content: 'C',
          authorId: 7,
          disabled: false,
          author: { id: 7, name: 'N', email: 'e@e.com' },
          createdAt: now,
        }),
      );
    });

    it('400 com erros de Zod', async () => {
      req.body = { title: 'T' };
      await PostController.create(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.any(Object),
        }),
      );
    });

    it('400 quando author não encontrado', async () => {
      req.body = { title: 'T', content: 'C', authorId: 7 };
      userFindByIdSpy.mockResolvedValue(null);

      await PostController.create(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Professor não encontrado.',
      });
    });

    it('400 quando author não for Professor (é Aluno)', async () => {
      req.body = { title: 'T', content: 'C', authorId: 7 };
      userFindByIdSpy.mockResolvedValue({
        id: 7,
        name: 'N',
        email: 'e@e.com',
        userTypeId: Roles.Aluno,
      });

      await PostController.create(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Professor Inválido.' });
    });
  });

  describe('list', () => {
    it('200 e array de posts', async () => {
      req.user = { userTypeId: Roles.Aluno } as JwtPayload;
      findManySpy.mockResolvedValue([fakePost]);

      await PostController.list(req as any, res as any);

      expect(jsonMock).toHaveBeenCalledWith([fakePost]);
    });
  });

  describe('show', () => {
    it('400 quando id inválido', async () => {
      req.params = { id: 'NaN' };
      await PostController.show(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'ID inválido' });
    });

    it('404 quando não encontrado', async () => {
      req.params = { id: '5' };
      req.user = { userTypeId: Roles.Professor } as JwtPayload;
      findByIdSpy.mockResolvedValue(null);

      await PostController.show(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Postagem não localizada.',
      });
    });

    it('200 quando encontrado', async () => {
      req.params = { id: '1' };
      req.user = { userTypeId: Roles.Professor } as JwtPayload;
      findByIdSpy.mockResolvedValue(fakePost);

      await PostController.show(req as any, res as any);

      expect(jsonMock).toHaveBeenCalledWith(fakePost);
    });

    it('404 quando Aluno tenta ver post desabilitado', async () => {
      req.params = { id: '1' };
      req.user = { userTypeId: Roles.Aluno } as JwtPayload;
      findByIdSpy.mockResolvedValue({ ...fakePost, disabled: true });

      await PostController.show(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Postagem não localizada.',
      });
    });

    it('404 quando getPostUseCase lança erro genérico', async () => {
      req.params = { id: '1' };
      req.user = { userTypeId: Roles.Professor } as JwtPayload;
      findByIdSpy.mockImplementation(() => {
        throw new Error('fail show');
      });

      await PostController.show(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'fail show' });
    });
  });

  describe('update', () => {
    beforeEach(() => {
      findByIdSpy.mockResolvedValue(fakePost);
    });

    it('400 id inválido', async () => {
      req.params = { id: 'x' };
      await PostController.update(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'ID inválido' });
    });

    it('400 Zod error', async () => {
      req.params = { id: '1' };
      req.body = { title: 123 };
      await PostController.update(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ errors: expect.any(Object) }),
      );
    });

    it('404 exception do use-case', async () => {
      req.params = { id: '1' };
      req.body = { title: 'T', content: 'C' };
      updateSpy.mockRejectedValue(new Error('não achou'));

      await PostController.update(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'não achou' });
    });

    it('200 com post atualizado', async () => {
      const updated = { ...fakePost, title: 'Novo' };
      req.params = { id: '1' };
      req.body = { title: 'Novo', content: 'C' };
      updateSpy.mockResolvedValue(updated);

      await PostController.update(req as any, res as any);

      expect(jsonMock).toHaveBeenCalledWith(updated);
    });
  });

  describe('delete', () => {
    it('400 id inválido', async () => {
      req.params = { id: 'x' };
      await PostController.delete(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'ID inválido' });
    });

    it('204 quando sucesso', async () => {
      req.params = { id: '1' };
      findByIdSpy.mockResolvedValue(fakePost);
      deleteSpy.mockResolvedValue(undefined);

      await PostController.delete(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('404 em falha', async () => {
      req.params = { id: '1' };
      findByIdSpy.mockResolvedValue(fakePost);
      deleteSpy.mockRejectedValue(new Error('não achou'));

      await PostController.delete(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'não achou' });
    });
  });

  describe('enable', () => {
    it('400 id inválido', async () => {
      req.params = { id: 'x' };
      await PostController.enable(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'ID inválido' });
    });

    it('204 quando sucesso', async () => {
      req.params = { id: '2' };
      findByIdSpy.mockResolvedValue({ ...fakePost, disabled: true });
      enableSpy.mockResolvedValue(undefined);

      await PostController.enable(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('404 em falha', async () => {
      req.params = { id: '2' };
      findByIdSpy.mockResolvedValue({ ...fakePost, disabled: true });
      enableSpy.mockRejectedValue(new Error('fail'));

      await PostController.enable(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'fail' });
    });
  });

  describe('disable', () => {
    it('400 quando id inválido', async () => {
      req.params = { id: 'NaN' };
      await PostController.disable(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'ID inválido' });
    });

    it('404 quando post não encontrado', async () => {
      req.params = { id: '1' };
      findByIdSpy.mockResolvedValue(null);

      await PostController.disable(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Postagem não localizada.',
      });
    });

    it('204 quando post já está desabilitado', async () => {
      req.params = { id: '2' };
      findByIdSpy.mockResolvedValue({ ...fakePost, disabled: true });

      await PostController.disable(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
      expect(disableSpy).not.toHaveBeenCalled();
    });

    it('204 quando o disable ocorre normalmente', async () => {
      req.params = { id: '3' };
      findByIdSpy.mockResolvedValue({ ...fakePost, disabled: false });
      disableSpy.mockResolvedValue(undefined);

      await PostController.disable(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
      expect(disableSpy).toHaveBeenCalledWith(3);
    });
  });

  describe('search', () => {
    it('400 Zod error', async () => {
      req.query = {};
      await PostController.search(req as any, res as any);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.any(Object),
        }),
      );
    });

    it('200 retorna array', async () => {
      req.query = { q: 'term' };
      req.user = { userTypeId: Roles.Aluno } as JwtPayload;
      searchSpy.mockResolvedValue([fakePost]);

      await PostController.search(req as any, res as any);
      expect(jsonMock).toHaveBeenCalledWith([fakePost]);
    });

    it('400 em erro de negócio', async () => {
      req.query = { q: 'term' };
      req.user = { userTypeId: Roles.Aluno } as JwtPayload;
      searchSpy.mockRejectedValue(new Error('fail'));

      await PostController.search(req as any, res as any);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'fail' });
    });
  });
});
