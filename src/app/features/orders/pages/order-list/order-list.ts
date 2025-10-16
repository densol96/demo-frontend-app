import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { OrderService } from '../../services/order-service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-order-list',
  imports: [CurrencyPipe],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
})
export class OrderList {
  private orderService = inject(OrderService);

  orders = this.orderService.orders;
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(force = false) {
    this.loading.set(true);
    this.error.set(null);
    this.orderService
      .loadOrders(force)
      ?.pipe(finalize(() => this.loading.set(false)))
      ?.subscribe({
        error: () => this.error.set('Orders are currently unavailable. Try again later!'),
      });
  }

  refresh() {
    this.orderService.loadOrders(true);
  }
}
