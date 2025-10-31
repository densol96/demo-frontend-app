import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUsers = createSelector(selectAuthState, (state) => state.users);

export const selectCurrentUser = createSelector(selectAuthState, (state) => state.currentUser);
export const selectIsLoggedIn = createSelector(selectCurrentUser, (currentUser) => !!currentUser);
export const selectUserName = createSelector(selectCurrentUser, (user) =>
  user ? user.username : 'Guest'
);

export const selectSecondsRemainingInSession = createSelector(
  selectAuthState,
  (state) => state.secondsRemainingInSession
);
