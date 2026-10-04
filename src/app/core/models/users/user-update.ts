import { UserType } from './user-type';

export interface UserUpdate {
  email?: string;
  password?: string;
  type?: UserType;
  isDeactivate?: boolean;
}