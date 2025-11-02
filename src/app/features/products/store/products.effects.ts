import { inject, Injectable } from '@angular/core';
import * as ProductsActions from './products.actions';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { selectProducts } from './products.selector';
import { catchError, map, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { ProductService } from '../services/product-service';
import { selectCurrentUser } from '../../auth/store/auth.selector';
import { Router } from '@angular/router';
import { extractErrorMessage } from '../../../shared/utils/extractErrorMessage';
import * as AppActions from '../../../core/store/app.actions';
import { Product, ProductUpsert } from '../models/product';
import { SHARED_APP_OPTIONS } from '../constants';

@Injectable()
export class ProductsEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private productService = inject(ProductService);
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
      switchMap(([{ changes, previous }, user]) => {
        if (!user || user?.role !== 'EMPLOYEE')
          return of(
            ProductsActions.editProductFailure({
              previous,
            }),
            AppActions.showError({
              ...SHARED_APP_OPTIONS,
              userMessage: 'Only employees can edit products',
              consoleMessage: 'User role !== employee',
              data: user,
            })
          );

        return this.productService.editProduct(previous.id, changes, user.id).pipe(
          switchMap((updated: Product) => {
            return of(ProductsActions.editProductSuccess({ updated, previous }));
          }),
          catchError((error) => {
            return of(
              ProductsActions.editProductFailure({
                previous,
              }),
              AppActions.showError({
                ...SHARED_APP_OPTIONS,
                consoleMessage: extractErrorMessage(error),
                data: error,
              })
            );
          })
        );
      })
    )
  );

  editProductSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.editProductSuccess),
      tap(() => this.router.navigate(['/products'])),
      map(({ previous, updated }) => {
        return AppActions.showSuccess({
          ...SHARED_APP_OPTIONS,
          consoleMessage: 'Product updated. Before and after',
          userMessage: 'Product has successfully beed updated!',
          data: [previous, updated],
        });
      })
    )
  );

  deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.deleteProduct),
      withLatestFrom(this.store.select(selectCurrentUser)),
      switchMap(([{ forDelete }, user]) => {
        if (!user || user?.role !== 'EMPLOYEE')
          return of(
            ProductsActions.deleteProductFailure({
              forDelete,
            }),
            AppActions.showError({
              ...SHARED_APP_OPTIONS,
              userMessage: 'Only employees can delete products',
              consoleMessage: 'User role !== employee',
              data: user,
            })
          );

        return this.productService.deleteProduct(forDelete.id, user.id).pipe(
          switchMap(() => {
            return of(
              AppActions.showSuccess({
                consoleMessage: 'Product has successfully been deleted!',
                ...SHARED_APP_OPTIONS,
                data: [forDelete],
              })
            );
          }),
          catchError((error) => {
            return of(
              ProductsActions.deleteProductFailure({
                forDelete,
              }),
              AppActions.showError({
                ...SHARED_APP_OPTIONS,
                consoleMessage: extractErrorMessage(error),
                data: error,
              })
            );
          })
        );
      })
    )
  );

  createProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.createProduct),
      withLatestFrom(this.store.select(selectCurrentUser)),
      map(([{ productUpsert }, user]) => {
        if (!user || user?.role !== 'EMPLOYEE')
          return AppActions.showError({
            ...SHARED_APP_OPTIONS,
            userMessage: 'Only employees can add new products',
            consoleMessage: 'User role !== employee',
            data: user,
          });
        return ProductsActions.createProductOptimistically({
          fakeProduct: { id: Date.now(), ...productUpsert },
          userId: user.id,
        });
      })
    )
  );

  createProductOptimistically$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.createProductOptimistically),
      switchMap(({ fakeProduct, userId }) => {
        const { id, ...productUpsert } = fakeProduct;

        return this.productService.createProduct(productUpsert, userId).pipe(
          switchMap((product) => {
            return of(
              ProductsActions.createProductSuccess({ fakeProductId: fakeProduct.id, product })
            );
          }),
          catchError((error) => {
            return of(
              ProductsActions.createProductFailure({
                fakeProductId: fakeProduct.id,
              }),
              AppActions.showError({
                ...SHARED_APP_OPTIONS,
                consoleMessage: extractErrorMessage(error),
                data: error,
              })
            );
          })
        );
      })
    )
  );

  createProductSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.createProductSuccess),
      tap(() => this.router.navigate(['/products'])),
      map(({ product }) => {
        return AppActions.showSuccess({
          ...SHARED_APP_OPTIONS,
          consoleMessage: 'Product has been created successfully',
          data: product,
        });
      })
    )
  );
}
