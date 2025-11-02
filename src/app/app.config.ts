import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { authReducer } from './features/auth/store/auth.reducer';
import { AuthEffects } from './features/auth/store/auth.effects';
import { productsReducer } from './features/products/store/products.reducer';
import { PRODUCTS_FEATURE_KEY } from './features/products/constants';
import { ProductsEffects } from './features/products/store/products.effects';
import { NotificationsEffects } from './core/store/app.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    provideStore(),
    provideState('auth', authReducer),
    provideState(PRODUCTS_FEATURE_KEY, productsReducer),
    provideEffects(AuthEffects, ProductsEffects, NotificationsEffects),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production,
    }),
  ],
};
