import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoggerService } from '../../../core/services/logger';
import { AuthService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notifications';
import { Cart } from '../models/cart';
import { readonlySignal } from '../../../shared/utils/readonlySignal';
import { environment } from '../../../../environments/environment';
import { catchError, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly httpClient = inject(HttpClient);
  private readonly logger = inject(LoggerService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  private readonly _cart = signal<Cart | null>(null);
  readonly cart = readonlySignal(this._cart);

  private readonly apiUrl = `${environment.apiUrl}/cart`;
  private lastLoadedAt: number | null = null;

  loadCart(force = false) {
    const loggedInUser = this.authService.currentUser();
    if (loggedInUser?.role !== 'CUSTOMER')
      return throwError(() => new Error('Employees have no carts'));

    const now = Date.now();
    const tooOld = !this.lastLoadedAt || now - this.lastLoadedAt > 60_000;

    const cartItems = this._cart()?.items;

    if (!force && !tooOld && cartItems && cartItems.length > 0) {
      const cachedCart = this._cart() as Cart;
      this.logger.info('CartService', 'Returning cached products', cachedCart);
      return of(cachedCart);
    }

    const params = new HttpParams().set('userId', loggedInUser.id.toString());

    return this.httpClient.get<Cart>(this.apiUrl, { params }).pipe(
      tap((cart) => {
        this.logger.success('CartService', 'Successfully loaded cart: ', cart);
        this._cart.set(cart);
      }),
      catchError((err) => {
        this.logger.error('CartService', `Failed to load cart`, err);
        return throwError(() => err);
      })
    );
  }

  addToCart(productId: number) {
    const loggedInUser = this.authService.currentUser();
    if (loggedInUser?.role !== 'CUSTOMER') return;

    const params = new HttpParams()
      .set('userId', loggedInUser.id.toString())
      .set('productId', productId.toString())
      .set('quantity', '1');

    return this.httpClient
      .post<Cart>(`${this.apiUrl}/add`, {}, { params })
      .pipe(
        tap((cart) => {
          this.logger.success('CartService', 'Successfully added product to cart: ', cart);
          this.notificationService.success('Successfully added product to cart: ');
          this._cart.set(cart);
        }),
        catchError((err) => {
          this.logger.error('CartService', `Failed to add to cart`, err);
          this.notificationService.success(
            'Adding to cart is currently unavailable.. Please, try again later!'
          );
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  removeFromCart(productId: number) {
    const loggedInUser = this.authService.currentUser();
    if (loggedInUser?.role !== 'CUSTOMER') return;

    const params = new HttpParams()
      .set('userId', loggedInUser.id.toString())
      .set('productId', productId.toString());

    const beforeUpdate = this._cart();

    this._cart.update((cart) => {
      if (!cart) return cart;
      return {
        ...cart,
        items: cart.items.filter((item) => item.productId !== productId),
      };
    });

    this.httpClient
      .delete<Cart>(`${this.apiUrl}/remove`, { params })
      .pipe(
        tap((cart) => {
          this.logger.success('CartService', `Removed product (id=${productId}) from cart`, cart);
          this.notificationService.success('Product has been removed from your cart!');
          this._cart.set(cart);
        }),
        catchError((err) => {
          this.logger.error(
            'CartService',
            `Failed to remove product (id=${productId}) from cart`,
            err
          );
          this._cart.set(beforeUpdate);
          this.notificationService.error('Failed to remove product from cart. Try again later.');
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  clearCart() {
    const loggedInUser = this.authService.currentUser();
    if (loggedInUser?.role !== 'CUSTOMER') return;

    const params = new HttpParams().set('userId', loggedInUser.id.toString());

    const beforeUpdate = this._cart();

    this._cart.update((cart) => {
      if (!cart) return cart;
      return {
        ...cart,
        items: [],
      };
    });

    this.httpClient
      .delete<Cart>(`${this.apiUrl}/clear`, { params })
      .pipe(
        tap((cart) => {
          this.logger.success('CartService', `Cart cleared.`, cart);
          this.notificationService.success('Cart cleared!');
          this._cart.set(cart);
        }),
        catchError((err) => {
          this.logger.error('CartService', `Failed to clear cart`, err);
          this._cart.set(beforeUpdate);
          this.notificationService.error('Failed to clear cart. Try again later.');
          return throwError(() => err);
        })
      )
      .subscribe();
  }
}
