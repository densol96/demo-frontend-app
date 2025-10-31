import { createReducer, on } from '@ngrx/store';
import { initialState } from './auth.state';
import * as AuthActions from './auth.actions';

export const authReducer = createReducer(
  initialState,

  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    currentUser: user,
  })),

  on(AuthActions.loginFailure, (state) => ({
    ...state,
    currentUser: null,
  })),

  on(AuthActions.logout, (state) => ({
    ...state,
    currentUser: null,
  })),

  on(AuthActions.autoLoginSuccess, (state, { user }) => ({
    ...state,
    currentUser: user,
  })),

  on(AuthActions.autoLoginFailure, (state) => ({
    ...state,
    currentUser: null,
  })),

  on(AuthActions.startLogoutTiсker, (state, { logoutInSecs }) => ({
    ...state,
    secondsRemainingInSession: logoutInSecs,
  })),

  on(AuthActions.tick, (state) => {
    const secsLeft = state.secondsRemainingInSession;
    return {
      ...state,
      secondsRemainingInSession: secsLeft && secsLeft > 0 ? secsLeft - 1 : secsLeft,
    };
  }),

  on(AuthActions.stopLogoutTiсker, (state) => ({
    ...state,
    secondsRemainingInSession: undefined,
  })),

  on(AuthActions.loadUsersSuccess, (state, { users }) => {
    return {
      ...state,
      users,
    };
  })
);
