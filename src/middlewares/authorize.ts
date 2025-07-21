import { Request, Response, NextFunction } from 'express'; 
import { Roles } from 'src/types/roles';

export function authorize(allowedTypes: Roles[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!allowedTypes.includes(user.userTypeId)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    next();
  };
}
