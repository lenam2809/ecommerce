import { Result } from '@/types';
import { BaseService } from './base-service';
import { Brand } from '@/types/brand';
import { CreateBrandDto, UpdateBrandDto } from '@/schemas/brand';
import api from '@/lib/axios';


// Hàm helper để xử lý tải file lên
const createFormDataFromBrand = (productData: CreateBrandDto | UpdateBrandDto) => {
    const formData = new FormData();

    // Xử lý trường hợp update, cần thêm id
    if ('id' in productData) {
        formData.append('id', productData.id);
    }

    // Thêm các trường cơ bản
    formData.append('code', productData.code);
    formData.append('name', productData.name);

    if (productData.description) {
        formData.append('description', productData.description);
    }


    if (productData.isActive !== undefined) {
        formData.append('isActive', productData.isActive.toString());
    }

    if (productData.categoryIds && productData.categoryIds.length > 0) {
        productData.categoryIds.forEach((id) => {
            formData.append('CategoryIds', id); // Lưu ý chữ C viết hoa đúng như tên property trong C#
        });
    }



    // Xử lý hình ảnh chính
    if (productData.logo instanceof File) {
        formData.append('logo', productData.logo);
    } else if (typeof productData.logo === 'string') {
        formData.append('logo', productData.logo);
    }

    return formData;
};

export class BrandService extends BaseService {
    constructor() {
        super('/brands'); // Endpoint là /brands
    }

    // Ghi đè phương thức getAll kèm theo kiểu dữ liệu cụ thể
    async getAllBrands(params?: any): Promise<Result<Brand[]>> {
        return this.getAll<Brand>(params);
    }

    // Ghi đè phương thức getById kèm theo kiểu dữ liệu cụ thể
    async getBrandById(id: string): Promise<Result<Brand>> {
        return this.getById<Brand>(id);
    }

    // Ghi đè phương thức create kèm theo kiểu dữ liệu cụ thể


    async createBrand(productData: CreateBrandDto): Promise<Result<Brand>> {
        const formData = createFormDataFromBrand(productData);
        const response = await api.post(
            `/brands`,
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
    async updateBrand(id: string, productData: UpdateBrandDto): Promise<Result<Brand>> {
        const formData = createFormDataFromBrand(productData);
        const response = await api.put(
            `/brands/${id}`,
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
    async deleteBrand(id: string): Promise<Result<Brand>> {
        return this.delete<Brand>(id);
    }
}

// Khởi tạo và export instance để sử dụng xuyên suốt ứng dụng
export const brandService = new BrandService();