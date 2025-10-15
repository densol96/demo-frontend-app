import { Routes } from '@angular/router';
import { routes as ProductRoutes } from './features/products/routes';
import { routes as OrderRoutes } from './features/orders/routes';
import { NotFound } from './pages/not-found/not-found';
import { PageLayout } from './core/layout/page-layout/page-layout';
import { Login } from './pages/login/login';
import { authGuard } from './core/guards/auth';

export const routes: Routes = [
  {
    path: '',
    component: PageLayout,
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', children: ProductRoutes },
      { path: 'orders', children: OrderRoutes, canMatch: [authGuard(true)] },
      { path: 'login', component: Login, canMatch: [authGuard(false)] },
      //   { path: 'cart'},
      //   { path: 'profile', component: ProfileComponent },
    ],
  },

  { path: '**', component: NotFound },
];
