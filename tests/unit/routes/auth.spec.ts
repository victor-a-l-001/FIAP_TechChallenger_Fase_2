import request from 'supertest';
import express, { Application, NextFunction, Request, Response } from 'express';
import authRouter from '../../../src/routes/auth';
import { AuthController } from '../../../src/controllers/auth';

function getSetCookies(h: string | string[] | undefined): string[] {
  if (Array.isArray(h)) return h;
  if (typeof h === 'string') return [h];
  return [];
}

jest.mock('../../../src/controllers/auth', () => {
  const login = jest.fn((req: Request, res: Response) => {
    res.cookie('jwt', 'access.token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    res.cookie('refresh', 'refresh.token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/api/auth/refresh',
    });
    return res.status(200).json({ token: 'access.token' });
  });

  const refresh = jest.fn((req: Request, res: Response) => {
    res.cookie('jwt', 'new.access.token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    res.cookie('refresh', 'new.refresh.token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/api/auth/refresh',
    });
    return res.status(200).json({ token: 'new.access.token' });
  });

  const session = jest.fn((req: Request, res: Response) => {
    const expAt = new Date(Date.now() + 60_000).toISOString();
    res.set('X-Session-Expires-At', expAt);
    return res.status(200).json({
      user: { name: 'User', email: 'user@example.com', roles: ['user'] },
      sub: '123',
      userTypeId: 1,
      exp: Math.floor(Date.now() / 1000) + 60,
      iat: Math.floor(Date.now() / 1000),
    });
  });

  const logout = jest.fn((_req: Request, res: Response) => res.status(204).send());

  return { AuthController: { login, refresh, session, logout } };
});

describe('Auth Router', () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRouter);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      res.status(500).json({ message: err?.message || 'internal error' });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('deve chamar AuthController.login e retornar 200 com token e cookies HttpOnly', async () => {
      const payload = { email: 'user@example.com', password: 'secret' };

      const res = await request(app).post('/auth/login').send(payload);

      expect(AuthController.login).toHaveBeenCalledTimes(1);
      expect(AuthController.login).toHaveBeenCalledWith(
        expect.objectContaining({ body: payload }),
        expect.anything(),
        expect.any(Function),
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ token: 'access.token' });

      const cookies = getSetCookies(res.header['set-cookie']);
      expect(cookies.some((c) => /jwt=/.test(c) && /HttpOnly/i.test(c))).toBe(true);
      expect(cookies.some((c) => /refresh=/.test(c) && /HttpOnly/i.test(c))).toBe(true);
    });

    it('deve propagar erro via next(err) e retornar 500', async () => {
      (AuthController.login as jest.Mock).mockImplementationOnce(
        (_req: Request, _res: Response, next: NextFunction) => next(new Error('boom')),
      );

      const res = await request(app).post('/auth/login').send({ email: 'x@x.com', password: 'y' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'boom' });
    });
  });

  describe('POST /auth/refresh', () => {
    it('deve retornar 200 com novo token e setar cookies de access e refresh', async () => {
      const res = await request(app).post('/auth/refresh');

      expect(AuthController.refresh).toHaveBeenCalledTimes(1);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ token: 'new.access.token' });

      const cookies = getSetCookies(res.header['set-cookie']);
      expect(cookies.some((c) => /jwt=/.test(c) && /HttpOnly/i.test(c))).toBe(true);
      expect(cookies.some((c) => /refresh=/.test(c) && /HttpOnly/i.test(c))).toBe(true);
    });

    it('deve retornar 401 quando o controller responder 401', async () => {
      (AuthController.refresh as jest.Mock).mockImplementationOnce(
        (_req: Request, res: Response) => res.status(401).json({ error: 'invalid refresh' }),
      );

      const res = await request(app).post('/auth/refresh');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'invalid refresh' });
      const cookies = getSetCookies(res.header['set-cookie']);
      expect(cookies.length).toBe(0); // sem cookies em erro
    });
  });

  describe('GET /auth/session', () => {
    it('deve retornar 200 com payload da sessão e header X-Session-Expires-At', async () => {
      const res = await request(app).get('/auth/session');

      expect(AuthController.session).toHaveBeenCalledTimes(1);
      expect(res.status).toBe(200);

      const hdr = res.header['x-session-expires-at'];
      expect(typeof hdr).toBe('string');
      expect(Number.isNaN(Date.parse(hdr as string))).toBe(false);

      expect(res.body).toMatchObject({
        user: { name: expect.any(String), email: expect.any(String), roles: expect.any(Array) },
        sub: expect.any(String),
        userTypeId: expect.any(Number),
        exp: expect.any(Number),
        iat: expect.any(Number),
      });
    });

    it('deve retornar 401 quando o controller responder 401', async () => {
      (AuthController.session as jest.Mock).mockImplementationOnce(
        (_req: Request, res: Response) => res.status(401).json({ error: 'expired' }),
      );

      const res = await request(app).get('/auth/session');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'expired' });
    });
  });

  describe('POST /auth/logout', () => {
    it('deve retornar 204 sem corpo', async () => {
      const res = await request(app).post('/auth/logout');

      expect(AuthController.logout).toHaveBeenCalledTimes(1);
      expect(res.status).toBe(204);
      expect(res.text).toBe('');
    });
  });
});
