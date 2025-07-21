import { User } from '@prisma/client';
import { CreateUserDTO, UpdateUserDTO } from '../schemas/user';

export interface UserRepository {
  create(data: CreateUserDTO): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  findMany(): Promise<User[]>;
  update(id: number, data: UpdateUserDTO): Promise<User>;
  delete(id: number): Promise<void>;
}
