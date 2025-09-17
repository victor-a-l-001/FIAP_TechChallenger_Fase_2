import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  userTypeId: number;
  user: {
    name: string;
    email: string;
    roles: string[];
  };
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}
