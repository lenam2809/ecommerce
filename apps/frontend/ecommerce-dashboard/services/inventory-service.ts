import api from '@/lib/axios';
import { BaseService } from './base-service';
import { Result } from '@/types';
import { InventoryItem, InventoryImportItem } from '@/types/inventory';

export class InventoryService extends BaseService {
    constructor() {
        super('/inventory');
    }

    /**
     * Lấy danh sách IMEI/Serial theo SKU ID
     */
    async getBySkuId(skuId: string): Promise<Result<InventoryItem[]>> {
        return this.get<InventoryItem[]>(`/inventory/sku/${skuId}`);
    }

    /**
     * Import lô IMEI/Serial Number
     */
    async importBatch(productVariantSkuId: string, items: InventoryImportItem[]): Promise<Result<number>> {
        const response = await api.post('/inventory/import', {
            productVariantSkuId,
            items,
        });
        return response.data;
    }
}

export const inventoryService = new InventoryService();
