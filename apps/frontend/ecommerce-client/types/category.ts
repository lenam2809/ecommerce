
export interface Category {
    id: string;
    name: string;
    image: string;
    slug: string;
    parentId?: number;
    children?: Category[];
    description?: string;
    productCount?: number;
}