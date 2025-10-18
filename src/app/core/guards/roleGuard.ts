import { CanMatchFn, Router } from '@angular/router';
import { UserRole } from '../model/user';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export function roleGuard(allowedRoles: UserRole[]): CanMatchFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const currentUser = auth.currentUser();

    if (!currentUser || !allowedRoles.includes(currentUser.role)) {
      return router.createUrlTree(['/']);
    }

    return true;
  };
}
