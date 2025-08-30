process.env.DATABASE_URL="dbTeste"
process.env.NODE_ENV="local"
process.env.HOST="localhost"
process.env.PORT="3000"
process.env.JWT_SECRET="sua-chave-secreta"
process.env.ORIGIN="http:localhost:3000/"

import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { authMiddleware } from '../../../src/middlewares/Authenticate';
import { config } from '../../../src/config';

jest.mock('jsonwebtoken');

describe('Middleware authenticate', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('retorna 401 se não fornecer Authorization header', () => {
    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token não fornecido' });
    expect(next).not.toHaveBeenCalled();
  });
 
  it('chama next e popula req.user em token válido', () => {
    const fakePayload = { userId: 7, userTypeId: 1 };
    (jwt.verify as jest.Mock).mockReturnValue(fakePayload);

    req.headers = { authorization: 'Bearer valid.token.here' };
    authMiddleware(req as Request, res as Response, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      'valid.token.here',
      config.jwt.secret,
      { algorithms: ['HS256'] }
    );

    expect((req as any).user).toEqual(fakePayload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('retorna 401 para token expirado', () => {

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new TokenExpiredError('jwt expired', new Date());
    });

    req.headers = { authorization: 'Bearer expired.token' };
    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token expirado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 401 para token inválido', () => {
    
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new JsonWebTokenError('invalid token');
    });

    req.headers = { authorization: 'Bearer bad.token' };
    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 500 em outros erros', () => {
    
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('some internal error');
    });

    req.headers = { authorization: 'Bearer any.token' };
    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno no servidor' });
    expect(next).not.toHaveBeenCalled();
  });
});
