import { Component, inject, input } from '@angular/core';
import { Product } from '../../models/product';
import { CurrencyPipe } from '@angular/common';
import { AuthService } from '../../../../core/services/auth';
import { ProductService } from '../../services/product-service';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  authService = inject(AuthService);
  productService = inject(ProductService);
  product = input.required<Product>();

  addToCart() {}

  onDelete() {
    this.productService.deleteProduct(this.product());
  }
}
