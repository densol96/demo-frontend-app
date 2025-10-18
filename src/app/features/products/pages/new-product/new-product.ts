import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product-service';
import { ProductUpsert } from '../../models/product';
import { ProductForm } from '../../components/product-form/product-form';
import { Modal } from '../../../../shared/components/modal/modal';

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
  private productService = inject(ProductService);

  submit(product: ProductUpsert) {
    this.productService.createProduct(product).subscribe(() => this.router.navigate(['/products']));
  }

  close() {
    this.router.navigate(['../']);
  }
}
