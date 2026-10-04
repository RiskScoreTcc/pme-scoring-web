import { UserType } from './user-type';
import { UserStatus } from './user-status';


export interface UserFilter {
  email?: string;
  type?: UserType;
  status?: UserStatus;
}