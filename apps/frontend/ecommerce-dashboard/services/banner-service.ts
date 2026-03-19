import { Result } from '@/types';
import { BaseService } from './base-service';
import { Banner } from '@/types/banner';
import { CreateBannerDto, UpdateBannerDto } from '@/schemas/banner/banner-schema';
import api from '@/lib/axios';
import { logger } from '@/lib/logger';


// Helper function to handle file uploads
const createFormDataFromBanner = (bannerData: CreateBannerDto | UpdateBannerDto) => {
    const formData = new FormData();

    if ('id' in bannerData) {
        formData.append('id', bannerData.id);
    }

    if ('title' in bannerData) {
        formData.append('title', bannerData.title);
    }

    if ('buttonText' in bannerData) {
        formData.append('buttonText', bannerData.buttonText || '');
    }

    if ('buttonLink' in bannerData) {
        formData.append('buttonLink', bannerData.buttonLink || '');
    }

    formData.append('description', bannerData.description?.toString() || '');

    if (bannerData.isActive !== undefined) {
        formData.append('isActive', bannerData.isActive.toString());
    }

    if (bannerData.image instanceof File) {
        formData.append('image', bannerData.image);
    }

    return formData;
};

export class BannerService extends BaseService {
    constructor() {
        super('/banner'); // Endpoint là /banners
    }

    // Ghi đè phương thức getAll kèm theo kiểu dữ liệu cụ thể
    async getAllBanners(params?: any): Promise<Result<Banner[]>> {
        return this.getAll<Banner>(params);
    }

    // Ghi đè phương thức getById kèm theo kiểu dữ liệu cụ thể
    async getBannerById(id: string): Promise<Result<Banner>> {
        return this.getById<Banner>(id);
    }

    // // Ghi đè phương thức create kèm theo kiểu dữ liệu cụ thể
    // async createBanner(data: CreateBannerDto): Promise<Result<Banner>> {
    //     return this.create<Banner, CreateBannerDto>(data);
    // }

    // Ghi đè phương thức create kèm theo kiểu dữ liệu cụ thể
    async createBanner(data: CreateBannerDto): Promise<Result<Banner>> {
        const formData = createFormDataFromBanner(data);
        logger.debug('formData', formData);
        const response = await api.post(
            `/banner`,
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
    // async updateBanner(id: string, data: UpdateBannerDto): Promise<Result<Banner>> {
    //     return this.update<Banner, UpdateBannerDto>(id, data);
    // }

    async updateBanner(id: string, data: UpdateBannerDto): Promise<Result<Banner>> {
        const formData = createFormDataFromBanner(data);
        const response = await api.put(
            `/banner/${id}`,
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
    async deleteBanner(id: string): Promise<Result<Banner>> {
        return this.delete<Banner>(id);
    }
}

// Khởi tạo và export instance để sử dụng xuyên suốt ứng dụng
export const bannerService = new BannerService();