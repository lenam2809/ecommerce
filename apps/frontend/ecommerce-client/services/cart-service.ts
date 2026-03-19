// cart-service.ts
import { Cart } from '@/types/cart';
import { BaseService } from './base-service';
import { Result } from '@/types';


class CartService extends BaseService {
  constructor() {
    super('/cart');
  }

  async getCart(): Promise<Result<Cart>> {
    return await this.get<Cart>('/cart');
  }

  async addToCart(
    productId: string,
    quantity: number,
    options?: { color?: string; size?: string }
  ): Promise<Result<Cart>> {
    return await this.post<Cart>('/cart/items', { productId, quantity, ...options });
  }

  async updateCartItem({ itemId, quantity }: { itemId: string; quantity: number }): Promise<Result<Cart>> {
    return await this.put<Cart>(`/cart/items`, { itemId, quantity });
  }

  async removeCartItem(itemId: string): Promise<Result<Cart>> {
    return await this.delete<Cart>(`items/${itemId}`);
  }

  async clearCart(): Promise<Result<Cart>> {
    return await this.delete<Cart>('');
  }

  async applyPromoCode(code: string): Promise<Result<Cart>> {
    return await this.post<Cart>('/cart/promo', { code });
  }
}

const cartService = new CartService();
export default cartService;