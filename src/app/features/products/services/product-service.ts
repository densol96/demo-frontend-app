import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { readonlySignal } from '../../../shared/utils/readonlySignal';
import { catchError, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoggerService } from '../../../core/services/logger';
import { Product, ProductUpsert } from '../models/product';
import { NotificationService } from '../../../core/services/notifications';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../auth/store/auth.selector';
import { PRODUCTS_API_URL } from '../constants';
import { selectProducts } from '../store/products.selector';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = PRODUCTS_API_URL;
  private readonly httpClient = inject(HttpClient);

  loadProducts() {
    return this.httpClient.get<Product[]>(this.apiUrl);
  }

  createProduct(product: ProductUpsert, userId: number) {
    const params = new HttpParams().set('requestorId', userId);
    return this.httpClient.post<Product>(`${this.apiUrl}`, product, { params });
  }

  editProduct(productId: number, changes: ProductUpsert, userId: number) {
    const params = new HttpParams().set('requestorId', userId);
    return this.httpClient.put<Product>(`${this.apiUrl}/${productId}`, changes, { params });
  }

  deleteProduct(productId: number, userId: number) {
    const params = new HttpParams().set('requestorId', userId);
    return this.httpClient.delete<void>(`${this.apiUrl}/${productId}`, { params });
  }
}
