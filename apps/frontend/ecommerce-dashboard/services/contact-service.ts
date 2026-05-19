import { Result } from '@/types';
import { BaseService } from './base-service';
import { ContactDto } from '@/types/contact';
import api from '@/lib/axios';

export class ContactService extends BaseService {
    constructor() {
        super('/contact');
    }

    async getAllContacts(): Promise<Result<ContactDto[]>> {
        return this.getAll<ContactDto>();
    }

    async getContactById(id: string): Promise<Result<ContactDto>> {
        return this.getById<ContactDto>(id);
    }

    async createContact(data: Omit<ContactDto, 'id'>): Promise<Result<{ id: string }>> {
        return this.create<{ id: string }, Omit<ContactDto, 'id'>>(data);
    }

    async updateContact(id: string, data: ContactDto): Promise<Result<boolean>> {
        return this.update<boolean, ContactDto>(id, data);
    }

    async updateContactStatus(id: string, isActive: boolean): Promise<Result<boolean>> {
        return api.patch(`/contact/${id}/status`, isActive);
    }

    async deleteContact(id: string): Promise<Result<boolean>> {
        return this.delete<boolean>(id);
    }
}

export const contactService = new ContactService();
