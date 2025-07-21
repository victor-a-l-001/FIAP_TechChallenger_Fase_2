import { Post } from './post';
import { UserType } from './userType';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  disabled: boolean;
  userTypeId: number;
  userType: UserType;
  createdAt: Date;
  updatedAt?: Date;
  posts: Post[];
}
