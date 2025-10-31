import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { LoggerService } from '../../../core/services/logger';
import { NotificationService } from '../../../core/services/notifications';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/model/user';

const AUTH_KEY = 'currentUserId';
const AUTH_EXP_KEY = 'authExpiry';
const SESSION_TIMEOUT = 5 * 60 * 1000;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly notification = inject(NotificationService);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  private saveUserToStorage(userId: number) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(userId));
    localStorage.setItem(AUTH_EXP_KEY, String(Date.now() + SESSION_TIMEOUT));
  }

  private removeUserFromStorage() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_EXP_KEY);
  }

  loginSuccess(user: User) {
    this.saveUserToStorage(user.id);
    this.logger.success('AuthService', `Logged in as ${user.username}`, user);
    this.notification.success('Login successful');
    this.router.navigateByUrl('/');
  }

  loginFailure(userId: number) {
    this.logger.warn('AuthService', `User with id ${userId} not found`);
    this.notification.error('Login service is currently unavailable.');
  }

  autoLoginSuccess(user: User) {
    this.logger.success('AuthService', `Auto logged in as ${user.username}`, user);
  }

  autoLoginFailure(userId: number) {
    this.logger.error('AuthService', `Auto logging failed for the user with the id of `, userId);
  }

  logout() {
    this.logger.warn('AuthService', `User is logged out`);
    this.removeUserFromStorage();
    this.router.navigateByUrl('/');
  }

  restoreUserIdAndSession(): { userId: number; secsLeftInSession: number } | null {
    try {
      const userIdAsStr = localStorage.getItem(AUTH_KEY);
      const expiry = localStorage.getItem(AUTH_EXP_KEY);
      const userId = Number(userIdAsStr);
      if (!expiry || Number.isNaN(userId)) return null;

      const numExpiry = Number(expiry);
      if (!Number.isNaN(numExpiry) && Date.now() > numExpiry) {
        this.removeUserFromStorage();
        return null;
      }

      this.logger.info(
        'AuthService',
        `Successfully restored user info from localStorage: ${userIdAsStr} => expiry ${expiry}`
      );
      return { userId, secsLeftInSession: Math.floor((numExpiry - Date.now()) / 1000) };
    } catch {
      return null;
    }
  }

  loadUsers() {
    return this.httpClient.get<User[]>(this.apiUrl).pipe(
      tap((users) => {
        this.logger.success('AuthService', 'Successfully loaded users: ', users);
      }),
      catchError((err) => {
        this.logger.error('AuthService', `Failed to load users`, err);
        this.notification.error('List of users is currently unavailable.');
        return throwError(() => err);
      })
    );
  }

  loadUser(id: number) {
    return this.httpClient.get<User>(`${this.apiUrl}/${id}`).pipe(
      tap((user) => {
        this.logger.success('AuthService', 'Successfully loaded user: ', user);
      }),
      catchError((err) => {
        this.logger.error('AuthService', `Failed to load user with the if of ${id}`, err);
        return throwError(() => err);
      })
    );
  }
}
