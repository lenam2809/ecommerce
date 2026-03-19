import api from '@/lib/axios';
import { BaseService } from './base-service';
import { Result } from '@/types';
import { Product } from '@/types/product';
import { CreateProductDto } from '@/schemas/product/createProductSchema';
import { UpdateProductDto } from '@/schemas/product/updateProductSchema';



// Hàm helper để xử lý tải file lên
const createFormDataFromProduct = (productData: CreateProductDto | UpdateProductDto) => {
    const formData = new FormData();

    // Xử lý trường hợp update, cần thêm id
    if ('id' in productData) {
        formData.append('id', productData.id);
    }

    // Thêm các trường cơ bản
    formData.append('code', productData.code);
    formData.append('name', productData.name);
    formData.append('sku', productData.sku);
    formData.append('price', productData.price.toString());

    if (productData.salePrice !== undefined) {
        formData.append('salePrice', productData.salePrice.toString());
    }

    formData.append('rating', productData.rating?.toString() || '0');
    formData.append('reviewCount', productData.reviewCount?.toString() || '0');

    if (productData.description) {
        formData.append('description', productData.description);
    }

    formData.append('stockQuantity', productData.stockQuantity.toString());

    if (productData.publishedDate) {
        formData.append('publishedDate', productData.publishedDate);
    }

    if (productData.isActive !== undefined) {
        formData.append('isActive', productData.isActive.toString());
    }
    if (productData.categoryId) {
        formData.append('categoryId', productData.categoryId);
    }
    if (productData.brandId) {
        formData.append('brandId', productData.brandId);
    }

    // Xử lý hình ảnh chính
    if (productData.mainImage instanceof File) {
        formData.append('mainImage', productData.mainImage);
    } else if (typeof productData.mainImage === 'string') {
        formData.append('mainImageUrl', productData.mainImage);
    }

    // Xử lý hình ảnh bổ sung
    if (productData.additionalImages && productData.additionalImages.length > 0) {
        productData.additionalImages.forEach((image, index) => {
            if (image instanceof File) {
                formData.append(`additionalImages`, image);
            } else if (typeof image === 'string') {
                formData.append(`additionalImageUrls[${index}]`, image);
            }
        });
    }

    // Xử lý thông số kỹ thuật
    if (productData.specifications && productData.specifications.length > 0) {
        productData.specifications.forEach((spec, index) => {
            if (spec.id) {
                formData.append(`specifications[${index}].id`, spec.id);
            }
            formData.append(`specifications[${index}].name`, spec.name);
            formData.append(`specifications[${index}].value`, spec.value);
        });
    }

    // Xử lý biến thể màu sắc
    if (productData.colors && productData.colors.length > 0) {
        productData.colors.forEach((color, index) => {
            formData.append(`colors[${index}]`, color);
        });
    }

    // Xử lý biến thể kích thước
    if (productData.sizes && productData.sizes.length > 0) {
        productData.sizes.forEach((size, index) => {
            formData.append(`sizes[${index}]`, size);
        });
    }

    return formData;
};

export class ProductService extends BaseService {
    constructor() {
        super('/products'); // Endpoint là /products
    }

    // Ghi đè phương thức getAll kèm theo kiểu dữ liệu cụ thể
    async getAllProducts(params?: any): Promise<Result<Product[]>> {
        return this.getAll<Product>(params);
    }

    // Ghi đè phương thức getById kèm theo kiểu dữ liệu cụ thể
    async getProductById(id: string): Promise<Result<Product>> {
        return this.getById(id);
    }

    async getProductsByCategoryId(id: string): Promise<Result<Product[]>> {
        return this.get<Product[]>(`/products/products-by-category/${id}`);
    }

    async getProductsByBrandId(id: string): Promise<Result<Product[]>> {
        return this.get<Product[]>(`/products/products-by-brand/${id}`);
    }


    // Phương thức tạo sản phẩm sử dụng FormData
    async createProduct(productData: CreateProductDto): Promise<Result<Product>> {
        const formData = createFormDataFromProduct(productData);
        const response = await api.post(
            `/products`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    // Phương thức cập nhật sản phẩm sử dụng FormData
    async updateProduct(productData: UpdateProductDto): Promise<Result<Product>> {
        const formData = createFormDataFromProduct(productData);
        const response = await api.put(
            `/products/${productData.id}`,
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
    async deleteProduct(id: string): Promise<Result<Product>> {
        return this.delete<Product>(id);
    }

    // Phương thức riêng cho ProductService
    async getProductsByCategory(category: string): Promise<Result<Product[]>> {
        return this.getAll<Product>({ category });
    }
}

// Khởi tạo và export instance để sử dụng xuyên suốt ứng dụng
export const productService = new ProductService();