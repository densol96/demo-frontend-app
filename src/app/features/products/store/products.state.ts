import { Product } from '../models/product';

export type ProductsState = {
  products: Product[];
  isLoading: boolean;
  error: string;
};

export const initialState: ProductsState = {
  products: [],
  isLoading: false,
  error: '',
};
