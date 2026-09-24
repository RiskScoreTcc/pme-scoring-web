import { UserType } from './user-type';
import { UserStatus } from './user-status';

export interface User {
  id: number;
  email: string;
  type: UserType;
  status: UserStatus;
  createdAt: string;
  lastAccess: string;
}
