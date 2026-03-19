export interface CustomerAddress {
    id: string;
    applicationUserId: string;
    addressType: string;
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateAddressDto {
    addressType: string;
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    isDefault: boolean;
}

export interface UpdateAddressDto extends CreateAddressDto {
    id: string;
}

export interface AddressesResponse {
    items: CustomerAddress[];
    totalCount: number;
}

// Thêm type cho form values
export type AddressFormValues = {
    addressType: string;
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    isDefault: boolean;
};