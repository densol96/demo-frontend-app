import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private authService = inject(AuthService);

  loadedUsers = this.authService.users;
  selectedUser = signal<string>('');

  ngOnInit(): void {
    this.authService.loadUsers().subscribe();
  }

  login() {
    if (!this.selectedUser()) return;
    this.authService.login(+this.selectedUser());
  }
}
