import { environment } from '../../../environments/environment';

export const PRODUCTS_FEATURE_KEY = 'products';
export const PRODUCTS_API_URL = `${environment.apiUrl}/products`;
export const RESULTS_PER_PAGE = 12;
export const SORT_BY = 'price';
export const SORT_ORDER = 'desc';
export const FIELDS = ['price', 'stock'];
