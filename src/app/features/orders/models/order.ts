import { OrderItem } from './order-item';

export interface Order {
  id: number;
  userId: number;
  totalPrice: number;
  items: OrderItem[];
}
