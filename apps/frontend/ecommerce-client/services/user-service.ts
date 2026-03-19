import { Address, User } from '@/types/user';
import { BaseService } from './base-service';
import { Result } from '@/types';
import { FormAddressSchema, FormUpdateUserSchema } from '@/schemas/user-schema';
import api from '@/lib/api';

// Helper function to handle file uploads
const createFormDataFromUser = (userData: FormUpdateUserSchema) => {
  const formData = new FormData();

  // Handle update case with ID
  if ('id' in userData && userData.id !== undefined && userData.id !== null) {
    formData.append('id', String(userData.id));
  }

  formData.append('firstName', userData.firstName);
  formData.append('lastName', userData.lastName);

  if (userData.phoneNumber) {
    formData.append('phoneNumber', userData.phoneNumber);
  }

  // Handle avatar file
  if (userData.avatar instanceof File) {
    formData.append('avatar', userData.avatar);
  } else if (typeof userData.avatar === 'string') {
    formData.append('avatarUrl', userData.avatar);
  }

  return formData;
};

class UserService extends BaseService {
  constructor() {
    super('/user');
  }

  async getCurrentUser(): Promise<Result<User>> {
    return await this.get<User>('/auth/profile');
  }

  async updateUser(userData: FormUpdateUserSchema): Promise<Result<User>> {
    const formData = createFormDataFromUser(userData);
    const response = await api.put(
      `/account`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async getAddresses(): Promise<Address[]> {
    const response = await this.get<Address[]>('/addresses');
    return response.data || [];
  }

  async addAddress(address: FormAddressSchema): Promise<Result<Address>> {
    return await this.post<Address>('/addresses', address);
  }

  async updateAddress(id: string, address: FormAddressSchema): Promise<Result<Address>> {
    return await this.put<Address>(`/addresses/${id}`, address);
  }

  async deleteAddress(id: string): Promise<void> {
    await this.delete(`/addresses/${id}`);
  }

  async setDefaultAddress(id: string): Promise<Result<Address[]>> {
    return await this.put<Address[]>(`/addresses/${id}/default`, {});
  }
}

const userService = new UserService();
export default userService;