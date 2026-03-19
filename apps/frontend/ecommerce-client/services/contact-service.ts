
// contact-service.ts
import { ContactInfo } from '@/types/contact';
import { BaseService } from './base-service';
import { Result } from '@/types';

class ContactService extends BaseService {
    constructor() {
        super('/contact');
    }

    async getContactActive(): Promise<Result<ContactInfo>> {
        return await this.get<ContactInfo>('/contact/active');
    }


    async getAllContacts(): Promise<Result<ContactInfo[]>> {
        return await this.getAll<ContactInfo>();
    }
}

const contactService = new ContactService();
export default contactService;