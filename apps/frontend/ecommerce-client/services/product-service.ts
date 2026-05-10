import { Product, ProductFilters, ProductsResponse, ReviewsResponse } from '@/types/product';
import { BaseService } from './base-service';
import { Result } from "@/types";

class ProductService extends BaseService {
  constructor() {
    super('/products');
  }

  async getProducts(filters: ProductFilters = {}): Promise<Result<ProductsResponse>> {
    console.log("Fetching products with filters:", filters);
    return await this.get<ProductsResponse>('/products/paged', filters);
  }

  async searchProducts(filters: ProductFilters = {}): Promise<Result<ProductsResponse>> {
    const params = {
      q: filters.q ?? filters.searchTerm ?? filters.keyword,
      categoryId: filters.categoryId ?? firstId(filters.categoryIds),
      brandId: filters.brandId ?? firstId(filters.brandIds),
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sortBy: normalizeSearchSort(filters.sortBy),
      isDescending: filters.isDescending,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
    };

    return await this.get<ProductsResponse>('/search/products', params);
  }

  async getProductById(id: string): Promise<Result<Product>> {
    return await this.getById<Product>(id);
  }

  async getProductBySlug(slug: string): Promise<Result<Product>> {
    return this.get<Product>(`/products/slug/${slug}`);
  }

  async getSimilarProducts(id: string): Promise<Result<Product[]>> {
    return await this.get<Product[]>(`/products/${id}/similar`);
  }

  async getProductReviews(id: string): Promise<Result<ReviewsResponse>> {
    return await this.get<ReviewsResponse>(`/products/${id}/reviews`);
  }

  async getFeaturedProducts(): Promise<Result<Product[]>> {
    return await this.get<Product[]>('/products/featured');
  }

  async getBestsellingProducts(): Promise<Result<Product[]>> {
    return await this.get<Product[]>('/products/bestselling'); // Fixed path and added await
  }

  async getSearchSuggestions(): Promise<Result<Product[]>> {
    return await this.get<Product[]>('/products/search-suggestions');
  }

}

function firstId(value?: string) {
  return value?.split(",").map((item) => item.trim()).find(Boolean);
}

function normalizeSearchSort(sortBy?: string) {
  switch (sortBy?.toLowerCase()) {
    case "createdat":
      return "newest";
    case "price-asc":
      return "price_asc";
    case "price-desc":
      return "price_desc";
    default:
      return sortBy;
  }
}

const productService = new ProductService();
export default productService;
