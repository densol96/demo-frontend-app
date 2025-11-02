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

export const createProduct = createAction(
  '[Product] Create Product',
  props<{ productUpsert: ProductUpsert }>()
);

export const createProductOptimistically = createAction(
  '[Product] Create Product Optimistically',
  props<{ fakeProduct: Product; userId: number }>()
);

export const createProductSuccess = createAction(
  '[Products] Create Product Success',
  props<{ fakeProductId: number; product: Product }>()
);
export const createProductFailure = createAction(
  '[Products] Create Product Failure',
  props<{ fakeProductId: number }>()
);

export const editProduct = createAction(
  '[Product] Edit Products',
  props<{ changes: ProductUpsert; previous: Product }>()
);
export const editProductSuccess = createAction(
  '[Products] Edit Product Success',
  props<{ previous: Product; updated: Product }>()
);
export const editProductFailure = createAction(
  '[Products] Edit Product Failure',
  props<{ previous: Product }>()
);

export const deleteProduct = createAction(
  '[Product] Delete Product',
  props<{ forDelete: Product }>()
);

export const deleteProductFailure = createAction(
  '[Products] Delete Product Failure',
  props<{ forDelete: Product }>()
);
