import { Request, Response, NextFunction } from 'express';
import { authorize } from '../../../src/middlewares/authorize';
import { Roles } from '../../../src/types/roles';
import { JwtPayload } from '../../../src/types/express';

describe('Middleware authorize', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    res = {
      status: statusMock,
      json: jsonMock,
    };
    next = jest.fn();
  });

  it('deve retornar 401 quando não há user em req', () => {
    const mw = authorize([Roles.Aluno, Roles.Professor]);

    // chamar middleware
    mw(req as Request, res as Response, next);

    // validações
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Não autenticado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 403 quando userTypeId não está em allowedTypes', () => {
    req.user = { userTypeId: Roles.Aluno } as JwtPayload;
    const mw = authorize([Roles.Professor]);

    mw(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Acesso negado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next quando userTypeId está em allowedTypes', () => {
    req.user = { userTypeId: Roles.Professor } as JwtPayload;
    const mw = authorize([Roles.Professor, Roles.Aluno]);

    mw(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });

  it('deve funcionar com apenas um tipo permitido', () => {
    req.user = { userTypeId: Roles.Aluno } as JwtPayload;
    const mw = authorize([Roles.Aluno]);

    mw(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });
});
