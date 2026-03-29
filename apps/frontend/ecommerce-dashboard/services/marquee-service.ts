import { Result } from '@/types';
import { BaseService } from './base-service';
import { MarqueeMessage, MarqueeGlobalStatus } from '@/types/marquee';
import { CreateMarqueeDto, UpdateMarqueeDto } from '@/schemas/marquee/marquee-schema';
import api from '@/lib/axios';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/api-error';
import { toast } from '@/hooks/use-toast';

export class MarqueeService extends BaseService {
    constructor() {
        super('/admin/marquee');
    }

    async getAllMarquees(): Promise<Result<MarqueeGlobalStatus>> {
        try {
            const response = await api.get<Result<MarqueeGlobalStatus>>('/admin/marquee');
            return response.data;
        } catch (error) {
            logger.error('Error fetching marquees:', error);
            handleApiError({
                error,
                context: { endpoint: '/admin/marquee', operation: 'getAllMarquees' },
                devTitle: 'Thông báo lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            });
            throw error;
        }
    }

    async createMarquee(data: CreateMarqueeDto): Promise<Result<string>> {
        try {
            const response = await api.post('/admin/marquee', data);
            return response.data;
        } catch (error) {
            logger.error('Error creating marquee:', error);
            handleApiError({
                error,
                context: { endpoint: '/admin/marquee', operation: 'createMarquee' },
                devTitle: 'Thông báo lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            });
            throw error;
        }
    }

    async updateMarquee(id: string, data: UpdateMarqueeDto): Promise<Result<void>> {
        try {
            const response = await api.put(`/admin/marquee/${id}`, data);
            return response.data;
        } catch (error) {
            logger.error('Error updating marquee:', error);
            handleApiError({
                error,
                context: { endpoint: `/admin/marquee/${id}`, operation: 'updateMarquee' },
                devTitle: 'Thông báo lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            });
            throw error;
        }
    }

    async deleteMarquee(id: string): Promise<Result<void>> {
        return this.delete<void>(id);
    }

    async toggleMarquee(id: string): Promise<Result<MarqueeMessage>> {
        try {
            const response = await api.patch(`/admin/marquee/${id}/toggle`);
            return response.data;
        } catch (error) {
            logger.error('Error toggling marquee:', error);
            handleApiError({
                error,
                context: { endpoint: `/admin/marquee/${id}/toggle`, operation: 'toggleMarquee' },
                devTitle: 'Thông báo lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            });
            throw error;
        }
    }

    async toggleGlobalMarquee(): Promise<Result<any>> {
        try {
            const response = await api.patch('/admin/marquee/toggle-global');
            return response.data;
        } catch (error) {
            logger.error('Error toggling global marquee:', error);
            handleApiError({
                error,
                context: { endpoint: '/admin/marquee/toggle-global', operation: 'toggleGlobalMarquee' },
                devTitle: 'Thông báo lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            });
            throw error;
        }
    }
}

export const marqueeService = new MarqueeService();
