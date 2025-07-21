import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  email: string;
  userTypeId: number;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}