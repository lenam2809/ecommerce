import { Category } from '@/types/category';
import { BaseService } from './base-service';
import { Result } from '@/types';


class CategoryService extends BaseService {
  constructor() {
    super('/categories');
  }

  async getCategories(): Promise<Result<Category[]>> {
    return await this.get<Category[]>('/categories'); // Fixed path and added await
  }

  async getTopPopularCategories(): Promise<Result<Category[]>> {
    return await this.get<Category[]>('/categories/popular');
  }

  async getCategoryById(id: string): Promise<Result<Category>> {
    return await this.getById<Category>(id);
  }


  async getCategoryBySlug(slug: string): Promise<Result<Category>> {
    return this.get<Category>(`/categories/slug/${slug}?includeChildren=false`);
  }

  async getCategoriesByBrandId(id: string): Promise<Result<Category[]>> {
    return this.get<Category[]>(`/categories/brand/${id}`);
  }

}

const categoryService = new CategoryService();
export default categoryService;