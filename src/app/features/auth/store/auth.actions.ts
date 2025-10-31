import { createAction, props } from '@ngrx/store';
import { User } from '../../../core/model/user';

export const login = createAction('[Auth] Login', props<{ userId: number }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ user: User }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ userId: number }>());

export const autoLogin = createAction('[Auth] Auto Login');
export const autoLoginSuccess = createAction(
  '[Auth] Auto Login Success',
  props<{ user: User; logoutInSecs: number }>()
);
export const autoLoginFailure = createAction('[Auth] Auto Login Failure');

export const logout = createAction('[Auth] Logout');

export const startLogoutTiсker = createAction(
  '[Auth] Start Ticker',
  props<{ logoutInSecs: number }>()
);

export const tick = createAction('[Auth] Timer Tick Minus One');

export const stopLogoutTiсker = createAction('[Auth] Stop Ticker');

export const loadUsers = createAction('[Auth] Load Users', (force: boolean = false) => ({
  force,
}));
export const loadUsersSuccess = createAction(
  '[Auth] Load Users Success',
  props<{ users: User[] }>()
);
export const loadUsersFailure = createAction(
  '[Auth] Load Users Failure',
  (message: string = 'Unable to load the suer at this time') => ({ message })
);
