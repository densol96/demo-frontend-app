import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { readonlySignal } from '../../../shared/utils/readonlySignal';
import { catchError, of, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoggerService } from '../../../core/services/logger';
import { Product } from '../models/product';
import { AuthService } from '../../../core/services/auth';
import { UserRole } from '../../../core/model/user';
import { NotificationService } from '../../../core/services/notifications';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly httpClient = inject(HttpClient);
  private readonly logger = inject(LoggerService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  private readonly _products = signal<Product[]>([]);
  readonly products = readonlySignal(this._products);

  private readonly apiUrl = `${environment.apiUrl}/products`;
  private lastLoadedAt: number | null = null;

  loadProducts(force = false) {
    const now = Date.now();
    const tooOld = !this.lastLoadedAt || now - this.lastLoadedAt > 60_000;

    if (!force && !tooOld && this._products().length > 0) {
      const cachedPoducts = this._products();
      this.logger.info('ProductService', 'Returning cached products', cachedPoducts);
      return of(cachedPoducts);
    }

    return this.httpClient.get<Product[]>(this.apiUrl).pipe(
      tap((products) => {
        this.logger.success('ProductService', 'Succeccfully loaded products: ', products);
        this._products.set(products);
      }),
      catchError((err) => {
        this.logger.error('AuthService', `Failed to load products`, err);
        return throwError(() => err);
      })
    );
  }

  deleteProduct(product: Product) {
    const loggedInUser = this.authService.currentUser();
    if (loggedInUser?.role !== 'EMPLOYEE') return;

    const params = new HttpParams().set('requestorId', loggedInUser.id.toString());

    const beforeDelete = this._products();
    this._products.update((prev) => prev.filter((p) => p.id !== product.id));

    this.httpClient
      .delete<void>(`${this.apiUrl}/${product.id}`, { params })
      .pipe(
        tap(() => {
          this.logger.success('ProductService', `Deleted product (id=${product.id})`);
          this.notificationService.success('Product has been removed!');
          this.loadProducts(true); // in case a different client also has deleted something
        }),
        catchError((err) => {
          this.logger.error('ProductService', `Failed to delete product (id=${product.id})`, err);
          this._products.set(beforeDelete);
          this.notificationService.error(
            'Product deletion is currently unavailable.. Try again later!'
          );
          return throwError(() => err);
        })
      )
      .subscribe();
  }
}
