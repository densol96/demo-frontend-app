import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard = (requiresAuth = true): CanMatchFn => {
  return (route: Route, segments: UrlSegment[]) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const isLoggedIn = !!auth.currentUser();

    if (!isLoggedIn && requiresAuth) {
      return router.createUrlTree(['/login']);
    }

    if (isLoggedIn && !requiresAuth) {
      return router.createUrlTree(['/']);
    }

    return true;
  };
};
