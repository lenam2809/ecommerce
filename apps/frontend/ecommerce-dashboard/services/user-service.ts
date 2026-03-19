import api from '@/lib/axios';
import { BaseService } from './base-service';
import { Result } from '@/types';
import { User, UserStatus, CustomerLevel } from '@/types/user';
import { FormCreateUserSchema, FormUpdateUserSchema } from '@/schemas/user';
import { Order } from '@/types/order';

// Helper function to handle file uploads
const createFormDataFromUser = (userData: FormCreateUserSchema | FormUpdateUserSchema) => {
    const formData = new FormData();

    // Handle update case with ID
    if ('id' in userData) {
        formData.append('id', userData.id);
    }

    // Add basic fields
    if ('email' in userData) {
        formData.append('email', userData.email);
    }

    if ('password' in userData) {
        formData.append('password', userData.password);
    }

    formData.append('firstName', userData.firstName);
    formData.append('lastName', userData.lastName);

    if (userData.phoneNumber) {
        formData.append('phoneNumber', userData.phoneNumber);
    }

    if (userData.customerLevel) {
        formData.append('customerLevel', userData.customerLevel.toString());
    }
    if (userData.promotionPoints) {
        formData.append('promotionPoints', userData.promotionPoints.toString());
    }
    if (userData.status) {
        formData.append('status', userData.status.toString());
    }

    // Handle role for creating users
    if ('role' in userData && userData.role) {
        formData.append('role', userData.role);
    }

    // Handle avatar file
    if (userData.avatar instanceof File) {
        formData.append('avatar', userData.avatar);
    } else if (typeof userData.avatar === 'string') {
        formData.append('avatarUrl', userData.avatar);
    }

    return formData;
};

export class UserService extends BaseService {
    constructor() {
        super('/users'); // Endpoint là /users
    }

    // Get all users with optional params
    async getAllUsers(params?: any): Promise<Result<User[]>> {
        return this.getAll<User>(params);
    }

    async getTopUsers(): Promise<Result<User[]>> {
        return this.get<User[]>('/users/top');
    }

    async getOrdersByUserId(id: string): Promise<Result<Order[]>> {
        return this.get<Order[]>(`/users/orders-by-user/${id}`);
    }

    // Get user by ID
    async getUserById(id: string): Promise<Result<User>> {
        return this.getById<User>(id);
    }

    // Create user with FormData
    async createUser(userData: FormCreateUserSchema): Promise<Result<User>> {
        const formData = createFormDataFromUser(userData);
        const response = await api.post(
            `/users`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    // Update user with FormData
    async updateUser(userData: FormUpdateUserSchema): Promise<Result<User>> {
        const formData = createFormDataFromUser(userData);
        const response = await api.put(
            `/users/${userData.id}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    // Delete user
    async deleteUser(id: string): Promise<Result<User>> {
        return this.delete<User>(id);
    }

    // Get users by customer level
    async getUsersByLevel(level: CustomerLevel): Promise<Result<User[]>> {
        return this.getAll<User>({ customerLevel: level });
    }

    // Get active users
    async getActiveUsers(): Promise<Result<User[]>> {
        return this.getAll<User>({ status: UserStatus.Active });
    }
}

// Initialize and export instance to use throughout the application
export const userService = new UserService();