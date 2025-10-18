import { Component, computed, effect, inject, signal } from '@angular/core';
import { ProductForm } from '../../components/product-form/product-form';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product-service';
import { ProductUpsert } from '../../models/product';
import { Modal } from '../../../../shared/components/modal/modal';

@Component({
  selector: 'app-edit-product',
  imports: [ProductForm, Modal],
  templateUrl: 'edit-product.html',
  styleUrl: 'edit-product.scss',
})
export class EditProduct {
  private router = inject(Router);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);

  product = computed(() => {
    return this.productService.findByIdFromAlreadyLoaded(
      Number(this.route.snapshot.paramMap.get('id'))
    );
  });

  constructor() {
    effect(() => {
      if (!this.product()) {
        setTimeout(() => this.router.navigate(['/products']), 3000);
      }
    });
  }

  submit(editedProduct: ProductUpsert) {
    const currentProduct = this.product();
    if (currentProduct)
      this.productService
        .editProduct(currentProduct.id, editedProduct)
        .subscribe(() => this.router.navigate(['/products']));
  }

  close() {
    this.router.navigate(['../']);
  }
}
