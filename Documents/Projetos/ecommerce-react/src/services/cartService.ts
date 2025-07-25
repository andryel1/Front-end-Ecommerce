import { apiService } from './api';
import type { Product } from './productService';

// Tipos/interfaces para carrinho
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Serviços de carrinho
export class CartService {
  static async getCart(): Promise<Cart> {
    return apiService.get<Cart>('/cart');
  }

  static async addToCart(item: AddToCartRequest): Promise<Cart> {
    return apiService.post<Cart>('/cart/items', item);
  }

  static async updateCartItem(itemId: string, update: UpdateCartItemRequest): Promise<Cart> {
    return apiService.put<Cart>(`/cart/items/${itemId}`, update);
  }

  static async removeFromCart(itemId: string): Promise<Cart> {
    return apiService.delete<Cart>(`/cart/items/${itemId}`);
  }

  static async clearCart(): Promise<void> {
    return apiService.delete<void>('/cart');
  }

  static async getCartItemsCount(): Promise<number> {
    const cart = await this.getCart();
    return cart.totalItems;
  }
}
