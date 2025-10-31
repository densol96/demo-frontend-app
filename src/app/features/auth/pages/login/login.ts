import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectUsers } from '../../store/auth.selector';
import { loadUsers, login } from '../../store/auth.actions';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, AsyncPipe],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private store = inject(Store);
  loadedUsers = this.store.select(selectUsers);
  selectedUserId = signal<string>('');

  ngOnInit(): void {
    this.store.dispatch(loadUsers());
  }

  login() {
    if (!this.selectedUserId()) return;
    this.store.dispatch(login({ userId: +this.selectedUserId() }));
  }
}
