import { inject, Injectable } from '@angular/core';
import * as ProductsActions from './products.actions';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { LoggerService } from '../../../core/services/logger';
import { NotificationService } from '../../../core/services/notifications';
import { selectProducts } from './products.selector';
import { catchError, map, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { ProductService } from '../services/product-service';
import { selectCurrentUser } from '../../auth/store/auth.selector';
import { Router } from '@angular/router';
import { extractErrorMessage } from '../../../shared/utils/extractErrorMessage';
import * as AppActions from '../../../core/store/app.actions';
import { Product } from '../models/product';

@Injectable()
export class ProductsEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private productService = inject(ProductService);
  private logger = inject(LoggerService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadProducts),
      withLatestFrom(this.store.select(selectProducts)),
      switchMap(([{ force }, products]) => {
        const actOn = (isSuccess: boolean, consoleMessage: string, data: unknown) => {
          const options = {
            showToUser: false,
            source: 'ProductsEffects',
            consoleMessage,
            data,
          };

          return of(
            isSuccess
              ? ProductsActions.loadProductsSuccess({ products: data as Product[] })
              : ProductsActions.loadProductsFailure(consoleMessage),
            isSuccess ? AppActions.showSuccess(options) : AppActions.showError(options)
          );
        };

        if (!force && products.length > 0)
          return actOn(true, 'Returning cached products', products);
        return this.productService.loadProducts().pipe(
          switchMap((products) => actOn(true, 'Products loaded', products)),
          catchError((err) => actOn(false, extractErrorMessage(err), err))
        );
      })
    )
  );

  editProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.editProduct),
      withLatestFrom(this.store.select(selectCurrentUser)),
      switchMap(([{ changes, oldProduct }, user]) => {
        if (!user || user?.role !== 'EMPLOYEE')
          return of(
            ProductsActions.editProductFailure({
              previous: oldProduct,
              message: 'Only employees can update new products',
            })
          );

        return this.productService.editProduct(oldProduct.id, changes, user.id).pipe(
          map(() => ProductsActions.editProductSuccess()),
          catchError((error) => {
            return of(
              ProductsActions.editProductFailure({
                previous: oldProduct,
                message: extractErrorMessage(error),
              })
            );
          })
        );
      })
    )
  );

  editProductSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ProductsActions.editProductSuccess),
        tap(() => {
          const msg = 'Product has successfully beed updated!';
          this.logger.success('ProductsEffects', msg);
          this.notification.success(msg);
          this.router.navigate(['/products']);
        })
      ),
    { dispatch: false }
  );

  editProductFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ProductsActions.editProductFailure),
        tap(({ message }) => {
          this.logger.error('ProductsEffects', message);
          this.notification.error(message);
        })
      ),
    { dispatch: false }
  );
}
