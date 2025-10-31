import { User } from '../../../core/model/user';

export type AuthState = {
  users: User[];
  currentUser: User | null | undefined;
  secondsRemainingInSession: number | undefined;
};

export const initialState: AuthState = {
  users: [],
  currentUser: undefined,
  secondsRemainingInSession: undefined,
};
