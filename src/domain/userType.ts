import { User } from './user';

export interface UserType {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  users: User[];
}
