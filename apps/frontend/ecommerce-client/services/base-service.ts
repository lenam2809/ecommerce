// 2. Tạo BaseService trong thư mục services/base.service.ts
import api from '@/lib/api';
import { Result } from '@/types';
import { AxiosResponse } from 'axios';
import { toast } from 'sonner';

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
            console.error(`Error fetching data from ${this.endpoint}:`, error);
            toast.error('Lỗi khi lấy dữ liệu', {
                description: `Không thể lấy dữ liệu từ ${this.endpoint}. Vui lòng thử lại sau.`,
            });
            throw error;
        }
    }

    async getOptions<T>(includeChildren?: boolean): Promise<Result<T[]>> {
        try {
            const response: AxiosResponse<Result<T[]>> = await api.get(`${this.endpoint}/options`, { params: { includeChildren } });
            return response.data;
        } catch (error) {
            console.error(`Error fetching data from ${this.endpoint}:`, error);
            toast.error('Lỗi khi lấy tùy chọn', {
                description: `Không thể lấy các tùy chọn từ ${this.endpoint}. Vui lòng thử lại sau.`,
            });
            throw error;
        }
    }

    // Phương thức lấy một item theo ID
    async getById<T>(id: string): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.get(`${this.endpoint}/${id}`);
            console.log("res:", response);
            return response.data;
        } catch (error) {
            console.error(`Error fetching item with id ${id} from ${this.endpoint}:`, error);
            toast.error('Lỗi khi lấy chi tiết', {
                description: `Không thể lấy dữ liệu với ID ${id} từ ${this.endpoint}. Vui lòng thử lại sau.`,
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
            console.error(`Error creating item in ${this.endpoint}:`, error);
            toast.error('Lỗi khi tạo mới', {
                description: `Không thể tạo mới dữ liệu trong ${this.endpoint}. Vui lòng thử lại sau.`,
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
            console.error(`Error updating item with id ${id} in ${this.endpoint}:`, error);
            toast.error('Lỗi khi cập nhật', {
                description: `Không thể cập nhật dữ liệu với ID ${id} trong ${this.endpoint}. Vui lòng thử lại sau.`,
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
            console.error(`Error deleting item with id ${id} from ${this.endpoint}:`, error);
            toast.error('Lỗi khi xóa', {
                description: `Không thể xóa dữ liệu với ID ${id} từ ${this.endpoint}. Vui lòng thử lại sau.`,
            });
            throw error;
        }
    }

    async get<T>(urlEndpoint: string, params?: any): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.get(urlEndpoint, { params });
            return response.data;
        } catch (error) {
            console.error(`Error fetching data from ${urlEndpoint}:`, error);
            toast.error('Lỗi khi lấy dữ liệu', {
                description: `Không thể lấy dữ liệu từ ${urlEndpoint}. Vui lòng thử lại sau.`,
            });
            throw error;
        }
    }

    async post<T>(urlEndpoint: string, data: any): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.post(urlEndpoint, data);
            return response.data;
        } catch (error) {
            console.error(`Error posting data to ${urlEndpoint}:`, error);
            toast.error('Lỗi khi gửi dữ liệu', {
                description: `Không thể gửi dữ liệu đến ${urlEndpoint}. Vui lòng thử lại sau.`,
            });
            throw error;
        }
    }

    async put<T>(urlEndpoint: string, data: any): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.put(urlEndpoint, data);
            return response.data;
        } catch (error) {
            console.error(`Error putting data to ${urlEndpoint}:`, error);
            toast.error('Lỗi khi cập nhật', {
                description: `Không thể cập nhật dữ liệu đến ${urlEndpoint}. Vui lòng thử lại sau.`,
            });
            throw error;
        }
    }

    async patch<T>(urlEndpoint: string, data?: any): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.patch(urlEndpoint, data);
            return response.data;
        } catch (error) {
            console.error(`Error patching data to ${urlEndpoint}:`, error);
            toast.error('Lỗi khi cập nhật', {
                description: `Không thể cập nhật dữ liệu đến ${urlEndpoint}. Vui lòng thử lại sau.`,
            });
            throw error;
        }
    }

    async deleteUrl<T>(urlEndpoint: string, data: string): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.delete(urlEndpoint, { data });
            return response.data;
        } catch (error) {
            console.error(`Error deleting data from ${urlEndpoint}:`, error);
            toast.error('Lỗi khi xóa dữ liệu', {
                description: `Không thể xóa dữ liệu từ ${urlEndpoint}. Vui lòng thử lại sau.`,
            });
            throw error;
        }
    }
}