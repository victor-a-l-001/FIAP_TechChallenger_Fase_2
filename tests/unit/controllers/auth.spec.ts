import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { AuthController } from '../../../src/controllers/auth';
import { LoginSchema } from '../../../src/schemas/auth';
import { UserRepositoryPrisma } from '../../../src/repositories/user-prisma';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../../src/repositories/user-prisma');

jest.mock('../../../src/config', () => ({
  config: {
    jwt: {
      secret: 'testsecret',
      expiresIn: '1h',
    },
  },
}));

describe('AuthController.login', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let cookieMock: jest.Mock;

  beforeEach(() => {
    req = { headers: {}, body: {}, cookies: {} };
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    cookieMock = jest.fn().mockReturnThis();
    res = { status: statusMock, json: jsonMock, cookie: cookieMock } as any;
    jest.clearAllMocks();
  });

  it('deve retornar 400 e erros de validação quando o body for inválido', async () => {
    req.body = { email: 'invalid-email', password: '123' };

    await AuthController.login(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      errors: expect.objectContaining({
        properties: expect.objectContaining({
          email: expect.objectContaining({
            errors: expect.arrayContaining(['E-mail inválido']),
          }),
          password: expect.objectContaining({
            errors: expect.arrayContaining(['Senha deve ter ao menos 6 caracteres']),
          }),
        }),
      }),
    });
    expect(cookieMock).not.toHaveBeenCalled();
  });

  it('deve retornar 401 quando o usuário não for encontrado', async () => {
    req.body = { email: 'a@b.com', password: '123456' };
    jest.spyOn(LoginSchema, 'parse').mockImplementation((v) => v as any);
    (UserRepositoryPrisma as unknown as jest.Mock).mockImplementation(() => ({
      findByEmail: jest.fn().mockResolvedValue(null),
    }));

    await AuthController.login(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Credenciais inválidas' });
    expect(cookieMock).not.toHaveBeenCalled();
  });

  it('deve retornar 401 quando a senha for inválida', async () => {
    req.body = { email: 'a@b.com', password: 'wrongpass' };
    jest.spyOn(LoginSchema, 'parse').mockImplementation((v) => v as any);

    const fakeUser = {
      id: 1,
      name: 'Teste',
      email: 'a@b.com',
      password: 'hashed-password',
      userTypeId: 1,
    };

    (UserRepositoryPrisma as unknown as jest.Mock).mockImplementation(() => ({
      findByEmail: jest.fn().mockResolvedValue(fakeUser),
    }));
    (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(false);

    await AuthController.login(req as Request, res as Response);

    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpass', 'hashed-password');
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Credenciais inválidas' });
    expect(cookieMock).not.toHaveBeenCalled();
  });

  it('deve gerar access+refresh, setar cookies e retornar 200 com { token } quando credenciais válidas', async () => {
    req.body = { email: 'a@b.com', password: 'rightpass' };
    jest.spyOn(LoginSchema, 'parse').mockImplementation((v) => v as any);

    const fakeUser = {
      id: 2,
      name: 'Teste',
      email: 'a@b.com',
      password: 'hashed-password',
      userTypeId: 2,
    };
    const fakeUserType = { id: 2, name: 'Admin' };

    (UserRepositoryPrisma as unknown as jest.Mock).mockImplementation(() => ({
      findByEmail: jest.fn().mockResolvedValue(fakeUser),
      findTypeId: jest.fn().mockResolvedValue(fakeUserType),
    }));

    (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);

    (jwt.sign as unknown as jest.Mock)
      .mockReturnValueOnce('access.token')
      .mockReturnValueOnce('refresh.token');

    (jwt.decode as unknown as jest.Mock).mockImplementation((t: string) =>
      t === 'access.token' ? { exp: 11111 } : { exp: 22222 }
    );

    await AuthController.login(req as Request, res as Response);

    const expectedAccessPayload = {
      sub: fakeUser.id.toString(),
      userTypeId: fakeUser.userTypeId,
      user: {
        name: fakeUser.name,
        email: fakeUser.email,
        roles: [fakeUserType.name],
      },
    };

    expect(jwt.sign).toHaveBeenNthCalledWith(
      1,
      expectedAccessPayload,
      'testsecret',
      expect.objectContaining({ expiresIn: '1h', algorithm: 'HS256' }),
    );

    expect(jwt.sign).toHaveBeenNthCalledWith(
      2,
      { sub: fakeUser.id.toString() },
      'testsecret',
      expect.objectContaining({ expiresIn: '7d', algorithm: 'HS256' }),
    );

    expect(cookieMock).toHaveBeenCalledWith(
      'jwt',
      'access.token',
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        expires: expect.any(Date),
      }),
    );
    expect(cookieMock).toHaveBeenCalledWith(
      'refresh',
      'refresh.token',
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/api/auth/refresh',
        expires: expect.any(Date),
      }),
    );

    expect(statusMock).not.toHaveBeenCalled();
  });

  it('deve retornar 500 em caso de erro não previsto', async () => {
    req.body = { email: 'a@b.com', password: 'anypass' };
    jest.spyOn(LoginSchema, 'parse').mockImplementation((v) => v as any);
    (UserRepositoryPrisma as unknown as jest.Mock).mockImplementation(() => ({
      findByEmail: jest.fn().mockRejectedValue(new Error('DB down')),
    }));

    await AuthController.login(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Erro interno no servidor' });
  });
});
