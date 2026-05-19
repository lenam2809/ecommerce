import { BaseService } from './base-service';
import {
    CustomerAddress,
    CreateAddressDto,
    UpdateAddressDto
} from '@/types/address';
import { Result } from "@/types";

class AddressService extends BaseService {
    constructor() {
        super('/addresses');
    }

    async getMyAddresses(): Promise<Result<CustomerAddress[]>> {
        return await this.get<CustomerAddress[]>('');
    }

    async getAddressById(id: string): Promise<Result<CustomerAddress>> {
        return await this.get<CustomerAddress>(`/${id}`);
    }

    async createAddress(data: CreateAddressDto): Promise<Result<string>> {
        return await this.post<string>('', data);
    }

    async updateAddress(id: string, data: UpdateAddressDto): Promise<Result<boolean>> {
        return await this.put(`/${id}`, data);
    }

    async deleteAddress(id: string): Promise<Result<boolean>> {
        return await this.delete(`/${id}`);
    }

    async setDefaultAddress(id: string): Promise<Result<boolean>> {
        return await this.patch<boolean>(`/${id}/set-default`);
    }
}

const addressService = new AddressService();
export default addressService;
