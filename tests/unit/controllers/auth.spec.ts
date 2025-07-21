// tests/unit/controllers/auth.spec.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';

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

  beforeEach(() => {
    req = { headers: {}, body: {} };
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    res = { status: statusMock, json: jsonMock };
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
            errors: expect.arrayContaining([
              'Senha deve ter ao menos 6 caracteres',
            ]),
          }),
        }),
      }),
    });
  });

  it('deve retornar 401 quando o usuário não for encontrado', async () => {
    req.body = { email: 'a@b.com', password: '123456' };
    // força parse bem-sucedido
    jest.spyOn(LoginSchema, 'parse').mockImplementation((v) => v as any);
    // findByEmail retorna null
    (UserRepositoryPrisma as jest.Mock).mockImplementation(() => ({
      findByEmail: jest.fn().mockResolvedValue(null),
    }));

    await AuthController.login(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Credenciais inválidas' });
  });

  it('deve retornar 401 quando a senha for inválida', async () => {
    req.body = { email: 'a@b.com', password: 'wrongpass' };
    jest.spyOn(LoginSchema, 'parse').mockImplementation((v) => v as any);
    const fakeUser = {
      id: 1,
      email: 'a@b.com',
      password: 'hashed-password',
      userTypeId: 1,
    };
    (UserRepositoryPrisma as jest.Mock).mockImplementation(() => ({
      findByEmail: jest.fn().mockResolvedValue(fakeUser),
    }));
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await AuthController.login(req as Request, res as Response);

    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpass', 'hashed-password');
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Credenciais inválidas' });
  });

  it('deve gerar token e retornar 200 com { token } quando credenciais válidas', async () => {
    req.body = { email: 'a@b.com', password: 'rightpass' };
    jest.spyOn(LoginSchema, 'parse').mockImplementation((v) => v as any);
    const fakeUser = {
      id: 2,
      email: 'a@b.com',
      password: 'hashed-password',
      userTypeId: 2,
    };
    (UserRepositoryPrisma as jest.Mock).mockImplementation(() => ({
      findByEmail: jest.fn().mockResolvedValue(fakeUser),
    }));
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const fakeToken = 'jwt.token.here';
    (jwt.sign as jest.Mock).mockReturnValue(fakeToken);

    await AuthController.login(req as Request, res as Response);

    const expectedPayload = {
      sub: fakeUser.id.toString(),
      email: fakeUser.email,
      userTypeId: fakeUser.userTypeId,
    };
    const expectedOpts: SignOptions = { expiresIn: '1h' };
    expect(jwt.sign).toHaveBeenCalledWith(
      expectedPayload,
      'testsecret',
      expectedOpts,
    );

    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).toHaveBeenCalledWith({ token: fakeToken });
  });

  it('deve retornar 500 em caso de erro não previsto', async () => {
    req.body = { email: 'a@b.com', password: 'anypass' };
    jest.spyOn(LoginSchema, 'parse').mockImplementation((v) => v as any);
    // força exceção genérica em findByEmail
    (UserRepositoryPrisma as jest.Mock).mockImplementation(() => ({
      findByEmail: jest.fn().mockRejectedValue(new Error('DB down')),
    }));

    await AuthController.login(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Erro interno no servidor',
    });
  });
});
