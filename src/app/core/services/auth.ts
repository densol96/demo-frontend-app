import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { User, UserRole } from '../model/user';
import { environment } from '../../../environments/environment';
import { catchError, of, tap, throwError } from 'rxjs';
import { LoggerService } from './logger';
import { readonlySignal } from '../../shared/utils/readonlySignal';
import { NotificationService } from './notifications';
import { Router } from '@angular/router';

const AUTH_KEY = 'currentUser';
const AUTH_EXP_KEY = 'authExpiry';
const SESSION_TIMEOUT = 5 * 60 * 1000;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);

  private readonly apiUrl = `${environment.apiUrl}/users`;

  private readonly _users = signal<User[]>([]);
  readonly users = readonlySignal(this._users);

  private readonly _currentUser = signal<User | null>(null);
  readonly currentUser = readonlySignal(this._currentUser);
  readonly isCustomer = computed(() => this._currentUser()?.role === 'CUSTOMER');
  readonly isEmployee = computed(() => this._currentUser()?.role === 'EMPLOYEE');

  private logoutTimer: ReturnType<typeof setTimeout> | null = null;

  private _secondsRemainingInSession = signal<number | undefined>(undefined);
  readonly secondsRemainingInSession = this._secondsRemainingInSession.asReadonly();

  private tillLogoutSecInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.autoLogin();
  }

  autoLogin() {
    const restored = this.restoreUser();
    if (restored) {
      const { user, msLeftInSession } = restored;
      this._currentUser.set(user);
      this.startAutoLogoutTimer(msLeftInSession);
      this.logger.info('AuthService', 'Restored user from localStorage', restored);
    }
  }

  loadUsers(force: boolean = false) {
    if (!force && this._users().length > 0) {
      const cachedUsers = this._users();
      this.logger.info('AuthService', 'Returning cached users', cachedUsers);
      return of(cachedUsers);
    }

    return this.httpClient.get<User[]>(this.apiUrl).pipe(
      tap((users) => {
        this.logger.success('AuthService', 'Succeccfully loaded users: ', users);
        this._users.set(users);
      }),
      catchError((err) => {
        this.logger.error('AuthService', `Failed to load users`, err);
        this.notificationService.error('List of users is currently unavailable.');
        return throwError(() => err);
      })
    );
  }

  clearCache() {
    this._users.set([]);
    this.logger.warn('AuthService', 'User cache cleared');
  }

  login(userId: number) {
    const found = this._users().find((u) => u.id === userId);

    if (!found) {
      this.logger.warn('AuthService', `User with id ${userId} not found`);
      this.notificationService.error('Login service is currently unavailable.');
      this._currentUser.set(null);
      return;
    }

    this._currentUser.set(found);
    this.saveUser(found);

    this.logger.success('AuthService', `Logged in as ${found.username}`, found);
    this.notificationService.success(`Login successfull`);
    this.router.navigateByUrl('/');

    this.startAutoLogoutTimer(SESSION_TIMEOUT);
  }

  logout() {
    this._currentUser.set(null);
    this.clearStorage();
    this.clearTimers();
    this.router.navigateByUrl('/');
  }

  private saveUser(user: User) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_EXP_KEY, String(Date.now() + SESSION_TIMEOUT));
  }

  private clearStorage() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_EXP_KEY);
  }

  private restoreUser(): { user: User; msLeftInSession: number } | null {
    try {
      const userData = localStorage.getItem(AUTH_KEY);
      const expiry = localStorage.getItem(AUTH_EXP_KEY);

      if (!userData || !expiry) return null;

      const numExpiry = Number(expiry);
      if (Date.now() > numExpiry) {
        this.clearStorage();
        return null;
      }

      return { user: JSON.parse(userData) as User, msLeftInSession: numExpiry - Date.now() };
    } catch {
      return null;
    }
  }

  private clearTimers() {
    this.clearAutoLogoutTimer();
    this.clearTillLogoutSecInterval();
  }

  private clearAutoLogoutTimer() {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  private clearTillLogoutSecInterval() {
    if (this.tillLogoutSecInterval) {
      clearInterval(this.tillLogoutSecInterval);
      this.tillLogoutSecInterval = null;
    }
  }

  private startAutoLogoutTimer(timeoutMs = SESSION_TIMEOUT) {
    this.clearTimers();
    this.logoutTimer = setTimeout(() => this.logout(), timeoutMs);

    const seconds = Math.round(timeoutMs / 1000);
    this._secondsRemainingInSession.set(seconds);
    this.tillLogoutSecInterval = setInterval(() => {
      this._secondsRemainingInSession.update((remaining) => {
        if (remaining === 10)
          this.notificationService.warning('You will be logged out in 10 seconds.');
        if (remaining && remaining > 0) return remaining - 1;
        if (remaining === 0) this.logout();
        return remaining;
      });
    }, 1000);
  }
}
