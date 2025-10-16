import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CartService } from '../../services/cart-service';
import { finalize } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import { CartItemCard } from '../../components/cart-item-card/cart-item-card';
import { OrderService } from '../../../orders/services/order-service';
import { ProductService } from '../../../products/services/product-service';

@Component({
  selector: 'app-cart-list',
  imports: [CartItemCard, CurrencyPipe],
  templateUrl: './cart-list.html',
  styleUrl: './cart-list.scss',
})
export class CartList implements OnInit {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);

  private cart = this.cartService.cart;
  loading = signal(false);
  error = signal<string | null>(null);
  total = computed(() =>
    (this.cart()?.items || []).reduce((sum, i) => sum + i.price * i.quantity, 0)
  );

  ngOnInit() {
    this.loadCart();
  }

  get cartItems() {
    return this.cart()?.items || [];
  }

  loadCart(force = false) {
    this.loading.set(true);
    this.error.set(null);
    this.cartService
      .loadCart(force)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        error: (err) => this.error.set('Cart service is currently unavailable. Try again later!'),
      });
  }

  checkout() {
    this.orderService.createOrderByCheckout().subscribe(() => {
      this.cartService.loadCart(true).subscribe();
      this.productService.loadProducts(true).subscribe();
    });
  }

  clearCart() {
    this.cartService.clearCart();
  }
}
