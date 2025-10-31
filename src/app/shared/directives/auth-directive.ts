import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { UserRole } from '../../core/model/user';
import { Store } from '@ngrx/store';
import { selectCurrentUser, selectIsLoggedIn } from '../../features/auth/store/auth.selector';

type AllRoles = 'AUTHENTICATED' | ''; // '' = when using *appAuth with no argument

/**
 * *appAuth — structural directive for conditional rendering
 * based on the user's authentication or role.
 *
 * Examples:
 *   <a *appAuth="'CUSTOMER'">Visible only to CUSTOMER</a>
 *   <a *appAuth="'AUTHENTICATED'">Visible to any logged-in user</a>
 *   <a *appAuth routerLink="/profile">Same as AUTHENTICATED</a>
 *   <div *appAuth="'AUTHENTICATED'; notLoggedInTml: loginTpl">Logout...</div>
 *   <ng-template #loginTpl>Login...</ng-template>
 */
@Directive({
  selector: '[appAuth]',
})
export class AuthDirective {
  /**
   * Main input.
   *
   * Can be a specific role, 'AUTHENTICATED', or empty string.
   *
   * Important:
   *  - When used as just `*appAuth` (no value),
   *    Angular adds the attribute [appAuth]="" to the template.
   *  - However, the directive input() receives `undefined`
   *    because Angular doesn’t create a binding expression.
   *
   * That’s why the type includes both `''` and `undefined`.
   */
  userRole = input<UserRole | AllRoles>(undefined, { alias: 'appAuth' });
  notLoggedInTml = input<TemplateRef<unknown>>(undefined, { alias: 'appAuthNotLoggedInTml' });

  private store = inject(Store);
  private currentUser = this.store.selectSignal(selectCurrentUser);
  private isLoggedIn = this.store.selectSignal(selectIsLoggedIn);
  private tpl = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      const role = this.userRole();
      const elseTpl = this.notLoggedInTml();
      const user = this.currentUser();
      const loggedIn = this.isLoggedIn();

      /**
       * If the directive is used with no role, or with 'AUTHENTICATED',
       * treat it as "visible for any logged-in user".
       */
      const allRolesPermited = role === 'AUTHENTICATED' || role === '' || role === undefined;
      const show = role === user?.role || (allRolesPermited && loggedIn);

      /**
       * Always clear the view container before updating it.
       * This ensures idempotency — repeated effect() executions
       * won't create duplicate views or leave stale ones.
       *
       * If we only cleared in the `else` branch,
       * repeated truthy states would stack multiple templates.
       */
      this.vcr.clear();
      if (show) {
        this.vcr.createEmbeddedView(this.tpl);
      } else if (elseTpl) {
        this.vcr.createEmbeddedView(elseTpl);
      }
    });
  }
}
