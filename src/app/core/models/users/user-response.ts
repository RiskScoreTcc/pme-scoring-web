import { UserType } from './user-type';
import { UserStatus } from './user-status';

export interface UserResponse {
  id: number;
  email: string;
  type: UserType;
  status: UserStatus;
  creationDate: string;
  lastAccess: string;
}