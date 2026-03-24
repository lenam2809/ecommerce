// 2. Tạo BaseService trong thư mục services/base.service.ts
import api from '@/lib/api';
import { Result } from '@/types';
import { AxiosResponse } from 'axios';
import { handleApiError } from '@/lib/api-error';
import { AppToaster } from '@/components/toast/app-toaster';

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
            handleApiError({
                error,
                context: { endpoint: this.endpoint, operation: 'getAll' },
                devTitle: 'Lỗi khi lấy dữ liệu',
                notify: ({ title, description, id }) => {
                    AppToaster.error(title, { description, id })
                },
            })
            throw error;
        }
    }

    async getOptions<T>(includeChildren?: boolean): Promise<Result<T[]>> {
        try {
            const response: AxiosResponse<Result<T[]>> = await api.get(`${this.endpoint}/options`, { params: { includeChildren } });
            return response.data;
        } catch (error) {
            handleApiError({
                error,
                context: { endpoint: `${this.endpoint}/options`, operation: 'getOptions' },
                devTitle: 'Lỗi khi lấy tùy chọn',
                notify: ({ title, description, id }) => {
                    AppToaster.error(title, { description, id })
                },
            })
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
            handleApiError({
                error,
                context: { endpoint: `${this.endpoint}/${id}`, operation: 'getById' },
                devTitle: 'Lỗi khi lấy chi tiết',
                notify: ({ title, description, id }) => {
                    AppToaster.error(title, { description, id })
                },
            })
            throw error;
        }
    }

    // Phương thức tạo item mới
    async create<T, D>(data: D): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.post(this.endpoint, data);
            return response.data;
        } catch (error) {
            handleApiError({
                error,
                context: { endpoint: this.endpoint, operation: 'create' },
                devTitle: 'Lỗi khi tạo mới',
                notify: ({ title, description, id }) => {
                    AppToaster.error(title, { description, id })
                },
            })
            throw error;
        }
    }

    // Phương thức cập nhật item
    async update<T, D>(id: string, data: D): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.put(`${this.endpoint}/${id}`, data);
            return response.data;
        } catch (error) {
            handleApiError({
                error,
                context: { endpoint: `${this.endpoint}/${id}`, operation: 'update' },
                devTitle: 'Lỗi khi cập nhật',
                notify: ({ title, description, id }) => {
                    AppToaster.error(title, { description, id })
                },
            })
            throw error;
        }
    }

    // Phương thức xóa item
    async delete<T>(id: string): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.delete(`${this.endpoint}/${id}`);
            return response.data;
        } catch (error) {
            handleApiError({
                error,
                context: { endpoint: `${this.endpoint}/${id}`, operation: 'delete' },
                devTitle: 'Lỗi khi xóa',
                notify: ({ title, description, id }) => {
                    AppToaster.error(title, { description, id })
                },
            })
            throw error;
        }
    }

    async get<T>(urlEndpoint: string, params?: any): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.get(urlEndpoint, { params });
            return response.data;
        } catch (error) {
            handleApiError({
                error,
                context: { endpoint: urlEndpoint, operation: 'get' },
                devTitle: 'Lỗi khi lấy dữ liệu',
                notify: ({ title, description, id }) => {
                    AppToaster.error(title, { description, id })
                },
            })
            throw error;
        }
    }

    async post<T>(urlEndpoint: string, data: any): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.post(urlEndpoint, data);
            return response.data;
        } catch (error) {
            handleApiError({
                error,
                context: { endpoint: urlEndpoint, operation: 'post' },
                devTitle: 'Lỗi khi gửi dữ liệu',
                notify: ({ title, description, id }) => {
                    AppToaster.error(title, { description, id })
                },
            })
            throw error;
        }
    }

    async put<T>(urlEndpoint: string, data: any): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.put(urlEndpoint, data);
            return response.data;
        } catch (error) {
            handleApiError({
                error,
                context: { endpoint: urlEndpoint, operation: 'put' },
                devTitle: 'Lỗi khi cập nhật',
                notify: ({ title, description, id }) => {
                    AppToaster.error(title, { description, id })
                },
            })
            throw error;
        }
    }

    async patch<T>(urlEndpoint: string, data?: any): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.patch(urlEndpoint, data);
            return response.data;
        } catch (error) {
            handleApiError({
                error,
                context: { endpoint: urlEndpoint, operation: 'patch' },
                devTitle: 'Lỗi khi cập nhật',
                notify: ({ title, description, id }) => {
                    AppToaster.error(title, { description, id })
                },
            })
            throw error;
        }
    }

    async deleteUrl<T>(urlEndpoint: string, data: string): Promise<Result<T>> {
        try {
            const response: AxiosResponse<Result<T>> = await api.delete(urlEndpoint, { data });
            return response.data;
        } catch (error) {
            handleApiError({
                error,
                context: { endpoint: urlEndpoint, operation: 'deleteUrl' },
                devTitle: 'Lỗi khi xóa dữ liệu',
                notify: ({ title, description, id }) => {
                    AppToaster.error(title, { description, id })
                },
            })
            throw error;
        }
    }
}