import request from 'supertest';
import express, { Application } from 'express';
import postsRouter from '../../../src/routes/post';
import { PostController } from '../../../src/controllers/post';
import { Roles } from '../../../src/types/roles';

jest.mock('../../../src/controllers/post', () => ({
  PostController: {
    search: jest.fn((req, res) => res.status(200).json([])),
    create: jest.fn((req, res) => res.status(201).json({ id: 1 })),
    list: jest.fn((req, res) => res.status(200).json([])),
    show: jest.fn((req, res) => res.status(200).json({ id: req.params.id })),
    update: jest.fn((req, res) => res.status(200).json({ id: req.params.id })),
    delete: jest.fn((req, res) => res.sendStatus(204)),
    disable: jest.fn((req, res) => res.sendStatus(204)),
    enable: jest.fn((req, res) => res.sendStatus(204)),
  },
}));

describe('Posts Router com autorização no /search', () => {
  let appAluno: Application;
  let appProfessor: Application;
  let appNoAuth: Application;

  beforeAll(() => {
    // 1) Aluno (permitido no authorize)
    appAluno = express();
    appAluno.use(express.json());
    appAluno.use((req, _, next) => {
      // simula req.user vindo do auth real
      (req as any).user = { userTypeId: Roles.Aluno };
      next();
    });
    appAluno.use('/posts', postsRouter);

    // 2) Professor (faz-tudo, também permitido)
    appProfessor = express();
    appProfessor.use(express.json());
    appProfessor.use((req, _, next) => {
      (req as any).user = { userTypeId: Roles.Professor };
      next();
    });
    appProfessor.use('/posts', postsRouter);

    // 3) Nenhum usuário (não autenticado)
    appNoAuth = express();
    appNoAuth.use(express.json());
    appNoAuth.use('/posts', postsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /posts/search como Aluno deve retornar 200 e chamar controller', async () => {
    const res = await request(appAluno)
      .get('/posts/search')
      .query({ q: 'term' });

    expect(PostController.search).toHaveBeenCalledWith(
      expect.objectContaining({ query: { q: 'term' } }),
      expect.anything(),
      expect.any(Function),
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /posts/search como Professor deve retornar 200 e chamar controller', async () => {
    const res = await request(appProfessor)
      .get('/posts/search')
      .query({ q: 'term' });

    expect(PostController.search).toHaveBeenCalledWith(
      expect.objectContaining({ query: { q: 'term' } }),
      expect.anything(),
      expect.any(Function),
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /posts/search sem autenticação deve retornar 401 e não chamar controller', async () => {
    const res = await request(appNoAuth)
      .get('/posts/search')
      .query({ q: 'term' });

    expect(PostController.search).not.toHaveBeenCalled();
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Não autenticado' });
  });
});

describe('Posts Router sem autorização (demais endpoints)', () => {
  let app: Application;

  beforeAll(() => {
    // Usamos Professor para garantir acesso a todos os endpoints
    app = express();
    app.use(express.json());
    app.use((req, _, next) => {
      (req as any).user = { userTypeId: Roles.Professor };
      next();
    });
    app.use('/posts', postsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /posts deve chamar create e retornar 201', async () => {
    const payload = { title: 'Novo post', content: 'Conteúdo' };
    const res = await request(app).post('/posts').send(payload);

    expect(PostController.create).toHaveBeenCalledWith(
      expect.objectContaining({ body: payload }),
      expect.anything(),
      expect.any(Function),
    );
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1 });
  });

  it('GET /posts deve chamar list e retornar 200', async () => {
    const res = await request(app).get('/posts');

    expect(PostController.list).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.anything(),
      expect.any(Function),
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /posts/:id deve chamar show e retornar 200', async () => {
    const res = await request(app).get('/posts/42');

    expect(PostController.show).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: '42' } }),
      expect.anything(),
      expect.any(Function),
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: '42' });
  });

  it('PUT /posts/:id deve chamar update e retornar 200', async () => {
    const payload = { title: 'Atualizado' };
    const res = await request(app).put('/posts/42').send(payload);

    expect(PostController.update).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: '42' }, body: payload }),
      expect.anything(),
      expect.any(Function),
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: '42' });
  });

  it('DELETE /posts/:id deve chamar delete e retornar 204', async () => {
    const res = await request(app).delete('/posts/42');

    expect(PostController.delete).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: '42' } }),
      expect.anything(),
      expect.any(Function),
    );
    expect(res.status).toBe(204);
  });

  it('PUT /posts/disable/:id deve chamar disable e retornar 204', async () => {
    const res = await request(app).put('/posts/disable/42');

    expect(PostController.disable).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: '42' } }),
      expect.anything(),
      expect.any(Function),
    );
    expect(res.status).toBe(204);
  });

  it('PUT /posts/enable/:id deve chamar enable e retornar 204', async () => {
    const res = await request(app).put('/posts/enable/42');

    expect(PostController.enable).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: '42' } }),
      expect.anything(),
      expect.any(Function),
    );
    expect(res.status).toBe(204);
  });
});
