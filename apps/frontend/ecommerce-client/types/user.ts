
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    avatar: string;
}

export interface Address {
    id: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    district?: string;
    ward?: string;
    isDefault: boolean;
}