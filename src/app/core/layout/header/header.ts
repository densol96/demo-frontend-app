import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Logo } from '../../../shared/components/logo/logo';
import { TimeFormatPipe } from '../../../shared/pipes/time-format-pipe';
import { AuthDirective } from '../../../shared/directives/auth-directive';
import { Store } from '@ngrx/store';
import {
  selectCurrentUser,
  selectSecondsRemainingInSession,
} from '../../../features/auth/store/auth.selector';
import { logout } from '../../../features/auth/store/auth.actions';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Logo, TimeFormatPipe, AuthDirective, AsyncPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private store = inject(Store);
  loggedInUser = this.store.select(selectCurrentUser);
  secondsRemainingInSession = this.store.select(selectSecondsRemainingInSession);

  logout() {
    this.store.dispatch(logout());
  }
}
