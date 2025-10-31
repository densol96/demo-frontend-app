import { CanMatchFn, Router } from '@angular/router';
import { UserRole } from '../model/user';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../features/auth/store/auth.selector';
import { filter, map, take } from 'rxjs';

export function roleGuard(allowedRoles: UserRole[]): CanMatchFn {
  return () => {
    const store = inject(Store);
    const router = inject(Router);

    return store.select(selectCurrentUser).pipe(
      filter((user) => user !== undefined),
      take(1),
      map((user) => {
        if (!user || !allowedRoles.includes(user.role)) {
          return router.createUrlTree(['/']);
        }
        return true;
      })
    );
  };
}
