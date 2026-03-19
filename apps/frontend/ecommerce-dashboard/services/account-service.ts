import api from '@/lib/axios';
import { Result } from '@/types';
import { User } from '@/types/user';

// Type definitions for profile and password change
export interface UpdateProfileRequest {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    address?: string;
    avatar?: File | string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

// Helper function to handle profile data with file uploads
const createFormDataFromProfile = (profileData: UpdateProfileRequest) => {
    const formData = new FormData();

    formData.append('firstName', profileData.firstName);
    formData.append('lastName', profileData.lastName);

    if (profileData.phoneNumber) {
        formData.append('phoneNumber', profileData.phoneNumber);
    }

    if (profileData.address) {
        formData.append('address', profileData.address);
    }

    // Handle avatar file
    if (profileData.avatar instanceof File) {
        formData.append('avatar', profileData.avatar);
    }

    return formData;
};

export class AccountService {
    // Get current user profile
    async getProfile(): Promise<Result<User>> {
        const response = await api.get('/account');
        return response.data;
    }

    // Update profile with FormData
    async updateProfile(profileData: UpdateProfileRequest): Promise<Result<boolean>> {
        const formData = createFormDataFromProfile(profileData);
        const response = await api.put(
            '/account',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    // Change password
    async changePassword(passwordData: ChangePasswordRequest): Promise<Result<boolean>> {
        const response = await api.put('/account/change-password', passwordData);
        return response.data;
    }
}

// Initialize and export instance to use throughout the application
export const accountService = new AccountService();