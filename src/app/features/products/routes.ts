import { Routes } from '@angular/router';
import { ProductList } from './pages/product-list/product-list';
import { ProductDetail } from './pages/product-detail/product-detail';
import { NewProduct } from './pages/new-product/new-product';
import { roleGuard } from '../../core/guards/role.guard';
import { EditProduct } from './pages/edit-product/edit-product';

export const routes: Routes = [
  {
    path: '',
    component: ProductList,
    children: [
      { path: 'add', component: NewProduct, canMatch: [roleGuard(['EMPLOYEE'])] },
      { path: 'edit/:id', component: EditProduct, canMatch: [roleGuard(['EMPLOYEE'])] },
    ],
  },
];
