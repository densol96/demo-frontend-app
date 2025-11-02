import { Component, inject, input } from '@angular/core';
import { Product } from '../../models/product';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../services/product-service';
import { CartService } from '../../../cart/services/cart-service';
import { AuthDirective } from '../../../../shared/directives/auth-directive';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { deleteProduct } from '../../store/products.actions';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, AuthDirective],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly cartService = inject(CartService);
  readonly product = input.required<Product>();

  addToCart() {
    this.cartService.addToCart(this.product().id);
  }

  onDelete() {
    this.store.dispatch(deleteProduct({ forDelete: this.product() }));
  }

  onEdit() {
    this.router.navigate(['products', 'edit', this.product().id]);
  }
}
