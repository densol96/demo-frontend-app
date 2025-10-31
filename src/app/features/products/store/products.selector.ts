import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductsState } from './products.state';
import { PRODUCTS_FEATURE_KEY } from '../constants';

export const selectProductsState = createFeatureSelector<ProductsState>(PRODUCTS_FEATURE_KEY);

export const selectProducts = createSelector(selectProductsState, (state) => state.products);
export const selectProductsAreLoading = createSelector(
  selectProductsState,
  (state) => state.isLoading
);
export const selectProductsError = createSelector(selectProductsState, (state) => state.error);

export const selectProductById = (id: number) =>
  createSelector(selectProducts, (products) => products.find((p) => p.id === id));
