import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../features/auth/store/auth.selector';
import { filter, map, take } from 'rxjs';

export const authGuard = (requiresAuth = true): CanMatchFn => {
  return (route: Route, segments: UrlSegment[]) => {
    const store = inject(Store);
    const router = inject(Router);

    return store.select(selectCurrentUser).pipe(
      filter((user) => user !== undefined),
      take(1),
      map((user) => {
        const isLoggedIn = !!user;

        if (!isLoggedIn && requiresAuth) {
          return router.createUrlTree(['/login']);
        }

        if (isLoggedIn && !requiresAuth) {
          return router.createUrlTree(['/']);
        }

        return true;
      })
    );
  };
};
