import { UserType } from './user-type';

export interface UserCreate {
  email: string;
  password: string;
  type: UserType;
}