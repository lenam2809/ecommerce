export enum EInventoryStatus {
    Available = 0,
    Reserved = 1,
    Sold = 2,
    Defective = 3,
    ReturnedToStock = 4,
}

export interface InventoryItem {
    id: string;
    productVariantSkuId: string;
    skuCode: string;
    productName: string;
    serialNumber: string;
    status: EInventoryStatus;
    statusDisplay: string;
    orderItemId?: string;
    importedAt: string;
    batchCode?: string;
    notes?: string;
}

export interface InventoryImportItem {
    serialNumber: string;
    batchCode?: string;
}

// Helpers
export const getInventoryStatusName = (status: EInventoryStatus): string => {
    switch (status) {
        case EInventoryStatus.Available: return "Có sẵn";
        case EInventoryStatus.Reserved: return "Đã đặt trước";
        case EInventoryStatus.Sold: return "Đã bán";
        case EInventoryStatus.Defective: return "Lỗi/Hỏng";
        case EInventoryStatus.ReturnedToStock: return "Đã trả kho";
        default: return "Không xác định";
    }
};

export const getInventoryStatusColor = (status: EInventoryStatus): string => {
    switch (status) {
        case EInventoryStatus.Available: return "text-green-600 bg-green-50 border-green-200";
        case EInventoryStatus.Reserved: return "text-amber-600 bg-amber-50 border-amber-200";
        case EInventoryStatus.Sold: return "text-blue-600 bg-blue-50 border-blue-200";
        case EInventoryStatus.Defective: return "text-red-600 bg-red-50 border-red-200";
        case EInventoryStatus.ReturnedToStock: return "text-purple-600 bg-purple-50 border-purple-200";
        default: return "";
    }
};
