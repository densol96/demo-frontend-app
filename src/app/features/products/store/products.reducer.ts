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

  on(ProductsActions.editProduct, (state, { oldProduct, changes }) => {
    const updatedProducts = state.products.map((p) =>
      p.id === oldProduct.id ? { ...p, ...changes } : p
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
  })
);
