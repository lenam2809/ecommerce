// about-service.ts
import { AboutInfo } from '@/types/about';
import { BaseService } from './base-service';
import { Result } from '@/types';


class AboutService extends BaseService {
    constructor() {
        super('/about');
    }

    async getAboutActive(): Promise<Result<AboutInfo>> {
        return await this.get<AboutInfo>('/about/active');
    }

    async getAbout(): Promise<Result<AboutInfo[]>> {
        return await this.getAll<AboutInfo>();
    }
}

const aboutService = new AboutService();
export default aboutService;