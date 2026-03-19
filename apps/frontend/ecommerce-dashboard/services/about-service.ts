import { Result } from '@/types';
import { BaseService } from './base-service';
import { AboutDto } from '@/types/about';
import api from '@/lib/axios';

export class AboutService extends BaseService {
    constructor() {
        super('/about'); // Endpoint là /about
    }

    async getAllAboutSections(): Promise<Result<AboutDto[]>> {
        return this.getAll<AboutDto>();
    }

    async getAboutSectionById(id: string): Promise<Result<AboutDto>> {
        return this.getById<AboutDto>(id);
    }

    async createAboutSection(data: AboutDto): Promise<Result<{ id: string }>> {
        return this.create<{ id: string }, AboutDto>(data);
    }

    async updateAboutSection(id: string, data: AboutDto): Promise<Result<boolean>> {
        return this.update<boolean, AboutDto>(id, data);
    }

    async updateAboutStatus(id: string, isActive: boolean): Promise<Result<boolean>> {
        return api.patch(`/about/${id}/status`, isActive);
    }


    async deleteAboutSection(id: string): Promise<Result<boolean>> {
        return this.delete<boolean>(id);
    }
}

export const aboutService = new AboutService();