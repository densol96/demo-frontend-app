import { createReducer, on } from '@ngrx/store';
import { initialState } from './products.state';
import * as ProductsActions from './products.actions';

export const productsReducer = createReducer(
  initialState,

  on(ProductsActions.loadProducts, (state) => {
    return { ...state, isLoading: true };
  }),

  on(ProductsActions.loadProductsSuccess, (state, { products }) => {
    return { ...state, isLoading: false, products };
  }),

  on(ProductsActions.loadProductsFailure, (state, { error }) => {
    return { ...state, isLoading: false, error };
  }),

  on(ProductsActions.createProductOptimistically, (state, { fakeProduct }) => {
    return {
      ...state,
      products: [...state.products, fakeProduct],
    };
  }),

  on(ProductsActions.createProductFailure, (state, { fakeProductId }) => {
    return {
      ...state,
      products: state.products.filter((p) => p.id !== fakeProductId),
    };
  }),

  on(ProductsActions.createProductSuccess, (state, { fakeProductId, product }) => {
    return {
      ...state,
      products: state.products.map((p) => (p.id === fakeProductId ? product : p)),
    };
  }),

  on(ProductsActions.editProduct, (state, { previous, changes }) => {
    const updatedProducts = state.products.map((p) =>
      p.id === previous.id ? { ...p, ...changes } : p
    );
    return {
      ...state,
      products: updatedProducts,
    };
  }),

  on(ProductsActions.editProductFailure, (state, { previous }) => {
    const revertedProducts = state.products.map((p) => (p.id === previous.id ? previous : p));
    return {
      ...state,
      products: revertedProducts,
    };
  }),

  on(ProductsActions.deleteProduct, (state, { forDelete }) => {
    return {
      ...state,
      products: state.products.filter((p) => p.id !== forDelete.id),
    };
  }),

  on(ProductsActions.deleteProductFailure, (state, { forDelete }) => {
    return {
      ...state,
      products: [...state.products, forDelete],
    };
  })
);
