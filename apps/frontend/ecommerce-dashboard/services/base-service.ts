// 2. Tạo BaseService trong thư mục services/base.service.ts
import { OptionType } from '@/components/ui/select/single-select';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { logger } from '@/lib/logger';
import { Result } from '@/types';
import { AxiosResponse } from 'axios';

export class BaseService {
    protected endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    // Phương thức lấy tất cả items
    async getAll<T>(params?: any): Promise<Result<T[]>> {
        try {
            const response: AxiosResponse<Result<T[]>> = await api.get(this.endpoint, { params });
            return response.data;
        } catch (error) {
            logger.error(`Error fetching data from ${this.endpoint}:`, error);
            toast({
                title: "Thông báo lỗi",
                description: `Lỗi khi lấy dữ liệu từ ${this.endpoint}`,
                variant: "destructive",
            });
            throw error;
        }
    }

    async getOptions<T>(includeChildren?: boolean): Promise<Result<T[]>> {
        try {
            const response: AxiosResponse<Result<T[]>> = await api.get(`${this.endpoint}/options`, { params: { includeChildren } });
            return response.data;
        } catch (error) {
            logger.error(`Error fetching data from ${this.endpoint}:`, error);
            toast({
                title: "Thông báo lỗi",
                description: `Lỗi khi lấy dữ liệu từ ${this.endpoint}`,
                variant: "destructive",
            });
            throw error;
        }
    }

    // Phương thức lấy một item theo ID
    async getById<T>(id: string): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.get(`${this.endpoint}/${id}`);
            logger.debug("res:", response);
            return response.data;
        } catch (error) {
            logger.error(`Error fetching item with id ${id} from ${this.endpoint}:`, error);
            toast({
                title: "Thông báo lỗi",
                description: `Lỗi khi lấy dữ liệu từ ${this.endpoint}`,
                variant: "destructive",
            });
            throw error;
        }
    }

    // Phương thức tạo item mới
    async create<T, D>(data: D): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.post(this.endpoint, data);
            return response.data;
        } catch (error) {
            logger.error(`Error creating item in ${this.endpoint}:`, error);
            toast({
                title: "Thông báo lỗi",
                description: `Lỗi khi lấy dữ liệu từ ${this.endpoint}`,
                variant: "destructive",
            });
            throw error;
        }
    }

    // Phương thức cập nhật item
    async update<T, D>(id: string, data: D): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.put(`${this.endpoint}/${id}`, data);
            return response.data;
        } catch (error) {
            logger.error(`Error updating item with id ${id} in ${this.endpoint}:`, error);
            toast({
                title: "Thông báo lỗi",
                description: `Lỗi khi lấy dữ liệu từ ${this.endpoint}`,
                variant: "destructive",
            });
            throw error;
        }
    }

    // Phương thức xóa item
    async delete<T>(id: string): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.delete(`${this.endpoint}/${id}`);
            return response.data;
        } catch (error) {
            logger.error(`Error deleting item with id ${id} from ${this.endpoint}:`, error);
            toast({
                title: "Thông báo lỗi",
                description: `Lỗi khi lấy dữ liệu từ ${this.endpoint}`,
                variant: "destructive",
            });
            throw error;
        }
    }

    async get<T>(urlEndpoint: string, params?: any): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.get(urlEndpoint, { params });
            return response.data;
        } catch (error) {
            logger.error(`Error fetching data from ${urlEndpoint}:`, error);
            toast({
                title: "Thông báo lỗi",
                description: `Lỗi khi lấy dữ liệu từ ${urlEndpoint}`,
                variant: "destructive",
            });
            throw error;
        }
    }

    async post<T>(urlEndpoint: string, data: any): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.post(urlEndpoint, data);
            return response.data;
        } catch (error) {
            logger.error(`Error posting data to ${urlEndpoint}:`, error);
            toast({
                title: "Thông báo lỗi",
                description: `Lỗi khi gửi dữ liệu đến ${urlEndpoint}`,
                variant: "destructive",
            });
            throw error;
        }
    }

    async put<T>(urlEndpoint: string, data: any): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.put(urlEndpoint, data);
            return response.data;
        } catch (error) {
            logger.error(`Error putting data to ${urlEndpoint}:`, error);
            toast({
                title: "Thông báo lỗi",
                description: `Lỗi khi cập nhật dữ liệu đến ${urlEndpoint}`,
                variant: "destructive",
            });
            throw error;
        }
    }

}