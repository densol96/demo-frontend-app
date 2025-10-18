import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Logo } from '../../../shared/components/logo/logo';
import { AuthService } from '../../services/auth';
import { TimeFormatPipe } from '../../../shared/pipes/time-format-pipe';
import { AuthDirective } from '../../../shared/directives/auth-directive';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Logo, TimeFormatPipe, AuthDirective],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authService = inject(AuthService);
  isLoggedIn = this.authService.isLoggedIn;

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
