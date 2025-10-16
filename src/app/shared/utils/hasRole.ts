import { computed, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { UserRole } from '../../core/model/user';

export function hasRole(userRole: UserRole) {
  const auth = inject(AuthService);
  return computed(() => auth.currentUser()?.role === userRole);
}
