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
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private store = inject(Store);
  private currentUser = this.store.selectSignal(selectCurrentUser);
  private products = this.store.selectSignal(selectProducts);

  loadProducts() {
    return this.httpClient.get<Product[]>(this.apiUrl);
  }

  editProduct(productId: number, changes: ProductUpsert, userId: number) {
    const params = new HttpParams().set('requestorId', userId);
    return this.httpClient.put<Product>(`${this.apiUrl}/${productId}`, changes, { params });
  }

  private makeRequest<T>({
    onlyEmployeeMsg,
    request,
    loggerSuccessMsg,
    notificationSuccess = loggerSuccessMsg,
    loggerFailureMsg,
    notificationFailure = loggerFailureMsg,
  }: {
    onlyEmployeeMsg: string;
    request: (params: HttpParams) => Observable<T>;
    loggerSuccessMsg: string;
    notificationSuccess?: string;
    loggerFailureMsg: string;
    notificationFailure: string;
  }) {
    const before = this.products();
    const loggedInUser = this.currentUser();

    let obs;
    if (!loggedInUser || loggedInUser?.role !== 'EMPLOYEE')
      obs = throwError(() => new Error(onlyEmployeeMsg));
    else {
      const params = new HttpParams().set('requestorId', loggedInUser.id.toString());
      obs = request(params);
    }

    return obs.pipe(
      tap((value) => {
        this.logger.success('ProductService', loggerSuccessMsg, value ?? '');
        this.notificationService.success(notificationSuccess);
        this.loadProducts().subscribe(); // RELOAD PRODUCTS TO HAVE DB AS A SOURCE OF TRUTH
      }),
      catchError((err) => {
        this.logger.error('ProductService', loggerFailureMsg, err);
        // this.products.set(before);
        this.notificationService.error(notificationFailure);
        return throwError(() => err);
      })
    );
  }

  createProduct(product: ProductUpsert) {
    return this.makeRequest({
      onlyEmployeeMsg: 'Only employees can create products',
      request: (params: HttpParams) => {
        // this._products.update((prev) => [...prev, { ...product, id: prev.length + 1 }]);
        return this.httpClient.post<Product>(`${this.apiUrl}`, product, { params });
      },
      loggerSuccessMsg: 'Product has been created',
      loggerFailureMsg: 'Failed to create a product',
      notificationFailure: 'Product creation is currently unavailable.. Try again later!',
    });
  }

  // editProduct(productId: number, product: ProductUpsert) {
  //   return this.makeRequest({
  //     onlyEmployeeMsg: 'Only employees can edit products',
  //     request: (params: HttpParams) => {
  //       this._products.update((prev) =>
  //         prev.map((prevProduct) =>
  //           prevProduct.id === productId ? { ...prevProduct, ...product } : prevProduct
  //         )
  //       );
  //       return this.httpClient.put<Product>(`${this.apiUrl}/${productId}`, product, { params });
  //     },
  //     loggerSuccessMsg: 'Product has been edited',
  //     loggerFailureMsg: 'Failed to edit a product',
  //     notificationFailure: 'Product edit is currently unavailable.. Try again later!',
  //   });
  // }

  deleteProduct(productId: number) {
    return this.makeRequest({
      onlyEmployeeMsg: 'Only employees can delete products',
      request: (params: HttpParams) => {
        // this._products.update((prev) => prev.filter((p) => p.id !== productId));
        return this.httpClient.delete<void>(`${this.apiUrl}/${productId}`, { params });
      },
      loggerSuccessMsg: 'Product has been deleted',
      loggerFailureMsg: 'Failed to delete a product',
      notificationFailure: 'Product deletion is currently unavailable.. Try again later!',
    });
  }

  /////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////
  // BEFORE REFACTORING (kept for reference..)
  /////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////
  // createProductOld(product: ProductUpsert) {
  //   const before = this._products();
  //   const loggedInUser = this.currentUser();

  //   let obs;

  //   if (!loggedInUser || loggedInUser?.role !== 'EMPLOYEE')
  //     obs = throwError(() => new Error('Only employees can create new products'));
  //   else {
  //     const params = new HttpParams().set('requestorId', loggedInUser.id.toString());
  //     this._products.update((prev) => [...prev, { ...product, id: prev.length + 1 }]);
  //     obs = this.httpClient.post<Product>(`${this.apiUrl}`, product, { params });
  //   }

  //   return obs.pipe(
  //     tap((product) => {
  //       this.logger.success('ProductService', `Created new product:`, product);
  //       this.notificationService.success('Product has been created!');
  //       this._products.update((prev) =>
  //         prev.map((prod) => (prod.id === product.id ? product : prod))
  //       );
  //     }),
  //     catchError((err) => {
  //       this.logger.error('ProductService', `Failed to create product:`, err);
  //       this._products.set(before);
  //       this.notificationService.error(
  //         'Product creation is currently unavailable.. Try again later!'
  //       );
  //       return throwError(() => err);
  //     }),
  //     switchMap(() => this.loadProducts(true)) // in case a different employee also has created something)
  //   );
  // }

  // deleteProductOld(product: Product) {
  //   const before = this._products();
  //   const loggedInUser = this.currentUser();

  //   let obs;

  //   if (!loggedInUser || loggedInUser?.role !== 'EMPLOYEE')
  //     obs = throwError(() => new Error('Only employees can delete products'));
  //   else {
  //     const params = new HttpParams().set('requestorId', loggedInUser.id.toString());
  //     this._products.update((prev) => prev.filter((p) => p.id !== product.id));
  //     obs = this.httpClient.delete<void>(`${this.apiUrl}/${product.id}`, { params });
  //   }

  //   obs
  //     .pipe(
  //       tap(() => {
  //         this.logger.success('ProductService', `Deleted product (id=${product.id})`);
  //         this.notificationService.success('Product has been removed!');
  //         this.loadProducts(true).subscribe(); // in case a different client also has deleted something
  //       }),
  //       catchError((err) => {
  //         this.logger.error('ProductService', `Failed to delete product (id=${product.id})`, err);
  //         this._products.set(before);
  //         this.notificationService.error(
  //           'Product deletion is currently unavailable.. Try again later!'
  //         );
  //         return throwError(() => err);
  //       })
  //     )
  //     .subscribe(); // instead of subscribing to the observable outside the service, in some situation can be done in service as well
  // }
}
