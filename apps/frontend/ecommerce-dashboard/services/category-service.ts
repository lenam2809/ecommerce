// 3. Tạo CategoryService trong thư mục services/product.service.ts
import { Result } from '@/types';
import { BaseService } from './base-service';
import { Category } from '@/types/category';
import { CreateCategoryDto, UpdateCategoryDto } from '@/schemas/category';
import api from '@/lib/axios';
import { logger } from '@/lib/logger';


// Helper function to handle file uploads
const createFormDataFromCategory = (categoryData: CreateCategoryDto | UpdateCategoryDto) => {
    const formData = new FormData();

    if ('id' in categoryData) {
        formData.append('id', categoryData.id);
    }

    if ('code' in categoryData) {
        formData.append('code', categoryData.code);
    }

    if ('name' in categoryData) {
        formData.append('name', categoryData.name);
    }

    formData.append('description', categoryData.description?.toString() || '');

    if (categoryData.parentId) {
        formData.append('parentId', categoryData.parentId);
    }

    if (categoryData.isActive !== undefined) {
        formData.append('isActive', categoryData.isActive.toString());
    }

    if (categoryData.image instanceof File) {
        formData.append('image', categoryData.image);
    }

    if (categoryData.brandIds && categoryData.brandIds.length > 0) {
        categoryData.brandIds.forEach(brandId => {
            formData.append('brandIds', brandId);
        });
    }

    return formData;
};


export class CategoryService extends BaseService {
    constructor() {
        super('/categories'); // Endpoint là /categories
    }

    // Ghi đè phương thức getAll kèm theo kiểu dữ liệu cụ thể
    async getAllCategories(params?: any): Promise<Result<Category[]>> {
        return this.getAll<Category>(params);
    }

    // Ghi đè phương thức getById kèm theo kiểu dữ liệu cụ thể
    async getCategoryById(id: string): Promise<Result<Category>> {
        return this.getById<Category>(id);
    }

    // Ghi đè phương thức create kèm theo kiểu dữ liệu cụ thể
    async createCategory(productData: CreateCategoryDto): Promise<Result<Category>> {
        const formData = createFormDataFromCategory(productData);
        logger.debug('formData', formData);
        const response = await api.post(
            `/categories`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    // Ghi đè phương thức update kèm theo kiểu dữ liệu cụ thể
    // Update user with FormData
    async updateCategory(categoryData: UpdateCategoryDto): Promise<Result<Category>> {
        const formData = createFormDataFromCategory(categoryData);
        const response = await api.put(
            `/categories/${categoryData.id}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    // Ghi đè phương thức delete kèm theo kiểu dữ liệu cụ thể
    async deleteCategory(id: string): Promise<Result<Category>> {
        return this.delete<Category>(id);
    }

    // Phương thức riêng cho CategoryService
    async getCategoriesByCategory(category: string): Promise<Result<Category[]>> {
        return this.getAll<Category>({ category });
    }

    async getCategoriesByBrandId(id: string): Promise<Result<Category[]>> {
        return this.get<Category[]>(`/categories/brand/${id}`);
    }
}

// Khởi tạo và export instance để sử dụng xuyên suốt ứng dụng
export const categoryService = new CategoryService();