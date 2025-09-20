import { Request, Response, NextFunction } from 'express';
import { UserRepositoryPrisma } from '../repositories/user-prisma';
import { Roles } from 'src/types/roles';

export function authorize(allowedTypes: Roles[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const repo = new UserRepositoryPrisma();
    const dbUser = await repo.findById(Number(user.sub));
    if (dbUser?.disabled) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!allowedTypes.includes(user.userTypeId)) {
      clearAuthCookies(res);
      return res.status(403).json({ error: 'Acesso negado' });
    }

    next();
  };

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
}
