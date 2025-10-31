import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, interval, of } from 'rxjs';
import { catchError, tap, switchMap, withLatestFrom, map, takeUntil } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { Store } from '@ngrx/store';
import { LoggerService } from '../../../core/services/logger';
import { NotificationService } from '../../../core/services/notifications';
import { SESSION_TIMEOUT_SECS } from '../constants/auth.constants';
import { AuthService } from '../services/auth.service';
import { selectSecondsRemainingInSession, selectUsers } from './auth.selector';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);

  private authService = inject(AuthService);
  private logger = inject(LoggerService);
  private notification = inject(NotificationService);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      withLatestFrom(this.store.select(selectUsers)),
      map(([{ userId }, users]) => {
        const user = users.find((u) => u.id === userId);
        return user ? AuthActions.loginSuccess({ user }) : AuthActions.loginFailure({ userId });
      })
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ user }) => this.authService.loginSuccess(user)),
      map(() => AuthActions.startLogoutTiсker({ logoutInSecs: SESSION_TIMEOUT_SECS }))
    )
  );

  loginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginFailure),
        tap(({ userId }) => this.authService.loginFailure(userId))
      ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => this.authService.logout()),
      map(() => AuthActions.stopLogoutTiсker())
    )
  );

  startLogoutTiсker$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.startLogoutTiсker),
      switchMap(() =>
        interval(1000).pipe(
          map(() => AuthActions.tick()),
          takeUntil(this.actions$.pipe(ofType(AuthActions.stopLogoutTiсker)))
        )
      )
    )
  );

  tick$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.tick),
      withLatestFrom(this.store.select(selectSecondsRemainingInSession)),
      switchMap(([_, remaining]) => {
        if (remaining === 10) this.notification.warning('You will be logged out in 10 seconds.');
        if (remaining === 0) return of(AuthActions.logout());
        return EMPTY;
      })
    )
  );

  autoLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.autoLogin),
      switchMap(() => {
        const restored = this.authService.restoreUserIdAndSession();
        if (restored) {
          const { userId, secsLeftInSession: logoutInSecs } = restored;
          return this.authService.loadUser(userId).pipe(
            map((user) => AuthActions.autoLoginSuccess({ user, logoutInSecs })),
            catchError(() => of(AuthActions.autoLoginFailure()))
          );
        }
        return of(AuthActions.autoLoginFailure());
      })
    )
  );

  autoLoginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.autoLoginSuccess),
      tap(({ user }) => this.authService.autoLoginSuccess(user)),
      map(({ logoutInSecs }) => AuthActions.startLogoutTiсker({ logoutInSecs }))
    )
  );

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUsers),
      withLatestFrom(this.store.select(selectUsers)),
      switchMap(([{ force }, users]) => {
        if (!force && users.length > 0) {
          const cachedUsers = users;
          this.logger.info('AuthEffects', 'Returning cached users', cachedUsers);
          return of(AuthActions.loadUsersSuccess({ users }));
        }
        return this.authService.loadUsers().pipe(
          map((users) => AuthActions.loadUsersSuccess({ users })),
          catchError(() => of(AuthActions.loadUsersFailure()))
        );
      })
    )
  );
}
