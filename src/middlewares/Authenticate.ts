import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { JwtPayload } from '../types/express';
import { config } from '../config';  

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const parts = authHeader.trim().split(/\s+/);
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token malformado' });
  }

  const [scheme, token] = parts;
  if (scheme.toLowerCase() !== 'bearer') {
    return res.status(401).json({ error: 'Token malformado' });
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] }) as JwtPayload;
    req.user = payload;
    return next();
  } catch (err: any) {
    if (err instanceof TokenExpiredError) {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (err instanceof JsonWebTokenError) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}