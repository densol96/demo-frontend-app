import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoggerService } from '../../../core/services/logger';
import { NotificationService } from '../../../core/services/notifications';
import { readonlySignal } from '../../../shared/utils/readonlySignal';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { Cart } from '../../cart/models/cart';
import { Order } from '../models/order';
import { catchError, of, tap, throwError } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../auth/store/auth.selector';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly httpClient = inject(HttpClient);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);

  private _orders = signal<Order[]>([]);
  readonly orders = readonlySignal(this._orders);

  private readonly apiUrl = `${environment.apiUrl}/orders`;
  private lastLoadedAt: number | null = null;

  private store = inject(Store);
  private currentUser = this.store.selectSignal(selectCurrentUser);

  loadOrders(force = false) {
    const loggedInUser = this.currentUser();
    if (loggedInUser?.role !== 'CUSTOMER')
      return throwError(() => new Error('Employees have no orders'));

    const now = Date.now();
    const tooOld = !this.lastLoadedAt || now - this.lastLoadedAt > 60_000;

    const cachedOrders = this._orders();
    if (!force && !tooOld && cachedOrders.length > 0) {
      this.logger.info('OrderService', 'Returning cached orders', cachedOrders);
      return of(cachedOrders);
    }

    return this.httpClient.get<Order[]>(`${this.apiUrl}/by-user/${loggedInUser.id}`).pipe(
      tap((orders) => {
        this.logger.success('OrderService', 'Successfully loaded orders: ', orders);
        this._orders.set(orders);
      }),
      catchError((err) => {
        this.logger.error('OrderService', `Failed to load orders`, err);
        return throwError(() => err);
      })
    );
  }

  createOrderByCheckout() {
    const loggedInUser = this.currentUser();
    if (loggedInUser?.role !== 'CUSTOMER')
      return throwError(() => new Error('Employees have no orders'));

    const ordersBefore = this._orders();

    const params = new HttpParams().set('userId', loggedInUser.id.toString());

    return this.httpClient.post<Order>(`${this.apiUrl}`, {}, { params }).pipe(
      tap((order) => {
        this.logger.success('OrderService', 'Successfully created order: ', order);
        this._orders.update((orders) => [...orders, order]);
        this.notificationService.success(`Your order has been created!`);
      }),
      catchError((err) => {
        this.logger.error('OrderService', `Failed to load orders`, err);
        this.notificationService.error(`Unable to proccess orders at this time. Try later.`);
        this._orders.set(ordersBefore);
        return throwError(() => err);
      })
    );
  }
}
