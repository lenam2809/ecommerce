import { Brand } from '@/types/brand';
import { BaseService } from './base-service';
import { Result } from '@/types';


class BrandService extends BaseService {
    constructor() {
        super('/brands');
    }

    async getBrands(): Promise<Result<Brand[]>> {
        return await this.getAll<Brand>();
    }

    async getBrandById(id: string): Promise<Result<Brand>> {
        return this.getById<Brand>(id);
    }

    async getBrandBySlug(slug: string): Promise<Result<Brand>> {
        return this.get<Brand>(`/brands/slug/${slug}`);
    }

    async getBrandByCategoryId(id: string): Promise<Result<Brand[]>> {
        return this.get<Brand[]>(`/brands/category/${id}`);
    }
}

const brandService = new BrandService();
export default brandService;