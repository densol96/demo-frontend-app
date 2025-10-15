import { computed, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth';

export function isLoggedIn() {
  const auth = inject(AuthService);
  return computed(() => !!auth.currentUser());
}
