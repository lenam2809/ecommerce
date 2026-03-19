// wishlist-service.ts
import { Wishlist } from '@/types/wishlist';
import { BaseService } from './base-service';
import { Result } from '@/types';


class WishlistService extends BaseService {
    constructor() {
        super('/wishlist');
    }

    /**
     * Get the current user's wishlist
     * @returns Promise with the user's wishlist data
     */
    async getUserWishlist(): Promise<Result<Wishlist>> {
        return await this.get<Wishlist>('/wishlist');
    }

    /**
     * Add a product to the user's wishlist
     * @param productId - The ID of the product to add
     * @returns Promise with the result of the operation
     */
    async addToWishlist(productId: string): Promise<Result<any>> {
        return await this.post<any>(`/wishlist/add/${productId}`, {});
    }

    /**
     * Remove a product from the user's wishlist
     * @param productId - The ID of the product to remove
     * @returns Promise with the result of the operation
     */
    async removeFromWishlist(productId: string): Promise<Result<any>> {
        return await this.delete<any>(`remove/${productId}`);
    }

    /**
     * Check if a product is in the user's wishlist
     * @param productId - The ID of the product to check
     * @returns Promise with boolean indicating if product is in wishlist
     */
    async checkProductInWishlist(productId: string): Promise<Result<boolean>> {
        return await this.get<boolean>(`/check/${productId}`);
    }
}

const wishlistService = new WishlistService();
export default wishlistService;