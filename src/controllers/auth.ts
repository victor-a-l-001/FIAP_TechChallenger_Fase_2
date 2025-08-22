import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import z, { ZodError } from 'zod';
import { LoginSchema } from '../schemas/auth';
import { UserRepositoryPrisma } from '../repositories/user-prisma';
import { config } from '../config';

type JWTExpiresIn = `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`;

const JWT_SECRET = config.jwt.secret as Secret;
const JWT_EXPIRES_IN = config.jwt.expiresIn as JWTExpiresIn;

const signOptions: SignOptions = {
  expiresIn: JWT_EXPIRES_IN,
};

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = LoginSchema.parse(req.body);
      const user = await new UserRepositoryPrisma().findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const userType = await new UserRepositoryPrisma().findTypeId(
        user.userTypeId,
      );
      const payload = {
        sub: user.id.toString(),
        userTypeId: user?.userTypeId,
        user: {
          name: user.name,
          email: user.email,
          roles: [userType?.name],
        },
      };
      const token = jwt.sign(payload, JWT_SECRET, signOptions);

      return res.json({ token });
    } catch (err: any) {
      if (err instanceof ZodError) {
        const tree = z.treeifyError(err);
        return res.status(400).json({ errors: tree });
      }
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }
}
