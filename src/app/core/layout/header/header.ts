import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Logo } from '../../../shared/components/logo/logo';
import { isLoggedIn } from '../../../shared/utils/isLoggedIn';
import { AuthService } from '../../services/auth';
import { TimeFormatPipe } from '../../../shared/pipes/time-format-pipe';
import { hasRole } from '../../../shared/utils/hasRole';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Logo, TimeFormatPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authService = inject(AuthService);
  readonly isLoggedIn = isLoggedIn();
  hasCustomerRole = hasRole('CUSTOMER');

  get username() {
    return this.authService.currentUser()?.username;
  }

  get timeLeftInSession() {
    return this.authService.secondsRemainingInSession();
  }

  logout() {
    this.authService.logout();
  }
}
