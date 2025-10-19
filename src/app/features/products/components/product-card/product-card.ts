import { Component, inject, input } from '@angular/core';
import { Product } from '../../models/product';
import { CurrencyPipe } from '@angular/common';
import { AuthService } from '../../../../core/services/auth';
import { ProductService } from '../../services/product-service';
import { CartService } from '../../../cart/services/cart-service';
import { AuthDirective } from '../../../../shared/directives/auth-directive';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, AuthDirective],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  router = inject(Router);
  authService = inject(AuthService);
  productService = inject(ProductService);
  cartService = inject(CartService);

  product = input.required<Product>();

  addToCart() {
    this.cartService.addToCart(this.product().id);
  }

  onDelete() {
    this.productService.deleteProduct(this.product().id);
  }

  onEdit() {
    this.router.navigate(['products', 'edit', this.product().id]);
  }
}
