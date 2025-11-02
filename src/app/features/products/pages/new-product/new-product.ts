import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product-service';
import { ProductUpsert } from '../../models/product';
import { ProductForm } from '../../components/product-form/product-form';
import { Modal } from '../../../../shared/components/modal/modal';
import { Store } from '@ngrx/store';
import { createProduct } from '../../store/products.actions';

@Component({
  selector: 'app-new-product',
  imports: [ProductForm, Modal],
  template: `
    <app-modal (close)="close()">
      <app-product-form title="Add New Product" (submitForm)="submit($event)" (cancel)="close()" />
    </app-modal>
  `,
})
export class NewProduct {
  private router = inject(Router);
  private store = inject(Store);

  submit(product: ProductUpsert) {
    this.store.dispatch(createProduct({ productUpsert: product }));
  }

  close() {
    this.router.navigate(['../']);
  }
}
