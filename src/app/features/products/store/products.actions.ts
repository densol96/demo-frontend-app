import { createAction, props } from '@ngrx/store';
import { Product, ProductUpsert } from '../models/product';

export const loadProducts = createAction('[Products] Load Products', (force: boolean = false) => ({
  force,
}));
export const loadProductsSuccess = createAction(
  '[Products] Load Products Success',
  props<{ products: Product[] }>()
);
export const loadProductsFailure = createAction(
  '[Products] Load Products Failure',
  (error: string = 'Products are not available right now. Try again later!') => ({ error })
);

export const editProduct = createAction(
  '[Product] Edit Products',
  props<{ changes: ProductUpsert; oldProduct: Product }>()
);
export const editProductSuccess = createAction('[Products] Edit Product Success');
export const editProductFailure = createAction(
  '[Products] Edit Product Failure',
  props<{ previous: Product; message: string }>()
);
