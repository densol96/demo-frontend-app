import { Component, inject, input } from '@angular/core';
import { CartItem } from '../../models/cart-item';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../services/cart-service';

@Component({
  selector: 'app-cart-item-card',
  imports: [CurrencyPipe],
  templateUrl: './cart-item-card.html',
  styleUrl: './cart-item-card.scss',
})
export class CartItemCard {
  cartService = inject(CartService);
  cartItem = input.required<CartItem>();

  onDelete() {
    this.cartService.removeFromCart(this.cartItem().productId);
  }
}
