import { Routes } from '@angular/router';
import { routes as ProductRoutes } from './features/products/routes';
import { routes as OrderRoutes } from './features/orders/routes';
import { routes as CartRoutes } from './features/cart/routes';
import { PageLayout } from './core/layout/page-layout';
import { Login } from './features/auth/pages/login/login';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { NotFound } from './core/pages/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    component: PageLayout,
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', children: ProductRoutes },
      { path: 'orders', children: OrderRoutes, canMatch: [roleGuard(['CUSTOMER'])] },
      { path: 'login', component: Login, canMatch: [authGuard(false)] },
      { path: 'cart', children: CartRoutes, canMatch: [roleGuard(['CUSTOMER'])] },
    ],
  },

  { path: '**', component: NotFound },
];
