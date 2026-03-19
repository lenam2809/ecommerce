// Interface cho Brand
export interface Brand {
    id: string;
    code: string;
    name: string;
    description: string;
    slug?: string;
    logoUrl?: string;
    isActive: boolean;
    categoryIds: string[];
    createdAt: string;
    productCount: number; // Số lượng sản phẩm liên kết
    categoryCount: number; // Số lượng danh mục liên kết
}
