import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions, JwtPayload } from 'jsonwebtoken';
import z, { ZodError } from 'zod';
import { LoginSchema } from '../schemas/auth';
import { UserRepositoryPrisma } from '../repositories/user-prisma';
import { config } from '../config';

const JWT_SECRET = config.jwt.secret as Secret;
 
const ACCESS_TTL = '1h';
const REFRESH_TTL_REMEMBER = '24h';
const REFRESH_TTL_NO_REMEMBER = '1h';
 
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const accessSignOptions: SignOptions = {
  expiresIn: ACCESS_TTL,
  algorithm: 'HS256',
};

const refreshSignOptionsBase: SignOptions = {
  algorithm: 'HS256',
};

export interface AppJwtPayload extends JwtPayload {
  sub: string;
  userTypeId: number;
  user: {
    name: string;
    email: string;
    roles: string[];
  };
}

type RefreshPayload = { sub: string; pr?: 0 | 1 };

function getTokenFromReq(req: Request): string | undefined {
  const tokenFromCookie = (req as any).cookies?.jwt as string | undefined;
  if (tokenFromCookie) return tokenFromCookie;
  const h = req.header('authorization');
  if (h?.startsWith('Bearer ')) return h.slice('Bearer '.length);
  return undefined;
}

function getRefreshFromReq(req: Request): string | undefined {
  return (req as any).cookies?.refresh as string | undefined;
}

function signAccessToken(payload: AppJwtPayload): { token: string; exp: number } {
  const token = jwt.sign(payload, JWT_SECRET, accessSignOptions);
  const { exp } = jwt.decode(token) as { exp: number };
  return { token, exp };
}

function signRefreshToken(
  payload: RefreshPayload,
  remember: boolean,
): { token: string; exp: number } {
  const expiresIn = remember ? REFRESH_TTL_REMEMBER : REFRESH_TTL_NO_REMEMBER;
  const token = jwt.sign(payload, JWT_SECRET, { ...refreshSignOptionsBase, expiresIn });
  const { exp } = jwt.decode(token) as { exp: number };
  return { token, exp };
}

function setAuthCookies(
  res: Response,
  access: { token: string; exp: number },
  refresh?: { token: string; exp: number },
  remember?: boolean,
) {
  res.cookie('jwt', access.token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: HOUR_MS,
  });

  if (refresh) {
    const base = {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      path: '/api/auth/refresh',
    };
    res.cookie('refresh', refresh.token, {
      ...base,
      maxAge: remember ? DAY_MS : HOUR_MS,
    } as any);
  }
}

function clearAuthCookies(res: Response) {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 0,
  });
  res.cookie('refresh', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/api/auth/refresh',
    maxAge: 0,
  });
}

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = LoginSchema.parse(req.body);
      const remember: boolean =
        typeof (req.body as any)?.remember === 'boolean'
          ? (req.body as any).remember
          : false;

      const repo = new UserRepositoryPrisma();
      const user = await repo.findByEmail(email);
      if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });

      const userType = await repo.findTypeId(user.userTypeId);
      const payload: AppJwtPayload = {
        sub: String(user.id),
        userTypeId: user.userTypeId,
        user: {
          name: user.name,
          email: user.email,
          roles: [userType?.name].filter(Boolean) as string[],
        },
      };

      const access = signAccessToken(payload);
      const refresh = signRefreshToken({ sub: payload.sub, pr: remember ? 1 : 0 }, remember);

      setAuthCookies(res, access, refresh, remember);

      return res.json({ message: 'Login Realizado com Sucesso.' });
    } catch (err: any) {
      if (err instanceof ZodError) {
        const tree = z.treeifyError(err);
        return res.status(400).json({ errors: tree });
      }
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const refreshToken = getRefreshFromReq(req);
      if (!refreshToken) return res.status(401).json({ error: 'Refresh token ausente' });

      const decoded = jwt.verify(refreshToken, JWT_SECRET) as JwtPayload & {
        sub: string;
        pr?: 0 | 1;
      };
      if (!decoded?.sub) return res.status(401).json({ error: 'Refresh inválido' });

      const repo = new UserRepositoryPrisma();
      const user = await repo.findById(Number(decoded.sub));
      if (!user) {
        clearAuthCookies(res);
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }
      const userType = await repo.findTypeId(user.userTypeId);
      const payload: AppJwtPayload = {
        sub: String(user.id),
        userTypeId: user.userTypeId,
        user: {
          name: user.name,
          email: user.email,
          roles: [userType?.name].filter(Boolean) as string[],
        },
      };

      const access = signAccessToken(payload);
      const remember = decoded.pr === 1;
      const rotatedRefresh = signRefreshToken({ sub: payload.sub, pr: remember ? 1 : 0 }, remember);

      setAuthCookies(res, access, rotatedRefresh, remember);

      return res.json({ token: access.token });
    } catch (err) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Refresh inválido ou expirado' });
    }
  }

  static async session(req: Request, res: Response) {
    try {
      const token = getTokenFromReq(req);
      if (!token) return res.sendStatus(401);

      const decoded = jwt.verify(token, JWT_SECRET) as AppJwtPayload;

      if (decoded.exp) {
        res.setHeader('X-Session-Expires-At', new Date(decoded.exp * 1000).toISOString());
      }

      const repo = new UserRepositoryPrisma();
      const user = await repo.findById(Number(decoded.sub));

      if (user?.disabled) {
        clearAuthCookies(res);
        return res.status(401).json({ error: 'Não autenticado' });
      }

      return res.status(200).json({
        user: decoded.user,
        sub: decoded.sub,
        userTypeId: decoded.userTypeId,
        exp: decoded.exp,
        iat: decoded.iat,
      });
    } catch {
      return res.sendStatus(401);
    }
  }

  static async logout(req: Request, res: Response) {
    clearAuthCookies(res);
    return res.sendStatus(204);
  }
}
