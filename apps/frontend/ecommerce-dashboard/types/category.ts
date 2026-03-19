export interface Category {
    id: string;
    code: string;
    name: string;
    description?: string;
    slug?: string;
    parentId?: string;
    isActive?: boolean;
    image?: string;
    children?: Category[];
    createdAt?: string;
    productCount?: number;
    brandIds?: string[];
}