import { OrderStatus } from "../types/OrderStatus";

export interface Product {
  unitPrice: number;
  image: string;
  quantity: number;
  size: string;
  totalPrice: number;
  cartId: string;
  name: string;
  id: string;
}

export interface Order {
  date: string; // ISO date string
  totalAmount: number;
  shippingAddress: string;
  products: Product[];
  orderId: string;
  userId: string;
  username: string;
  status: OrderStatus;
  paymentMethod: string;
}
