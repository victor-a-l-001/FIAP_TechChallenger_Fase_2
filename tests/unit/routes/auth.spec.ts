import request from 'supertest';
import express, { Application } from 'express';
import authRouter from '../../../src/routes/auth';
import { AuthController } from '../../../src/controllers/auth';

// Mock do método de login
jest.mock('../../../src/controllers/auth', () => ({
  AuthController: {
    login: jest.fn((req, res) => res.status(200).json({ token: 'jwt-token' })),
  },
}));

describe('Auth Router', () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('deve chamar AuthController.login e retornar 200 com o token', async () => {
      const payload = { username: 'user@example.com', password: 'secret' };
      const res = await request(app).post('/auth/login').send(payload);

      expect(AuthController.login).toHaveBeenCalledWith(
        expect.objectContaining({ body: payload }),
        expect.anything(),
        expect.any(Function),
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ token: 'jwt-token' });
    });
  });
});
