export type UserRole = 'EMPLOYEE' | 'CUSTOMER';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}
