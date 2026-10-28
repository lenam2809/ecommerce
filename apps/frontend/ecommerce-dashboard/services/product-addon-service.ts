import api from '@/lib/axios'
import { BaseService } from './base-service'
import { Result } from '@/types'
import {
  ProductAddOn,
  CreateProductAddOnRequest,
  UpdateProductAddOnRequest,
  ProductAddOnFilters,
} from '@/types/product-addon'

export class ProductAddOnService extends BaseService {
  constructor() {
    super('/ProductAddOns')
  }

  async getAllProductAddOns(filters?: ProductAddOnFilters): Promise<Result<ProductAddOn[]>> {
    return this.getAll<ProductAddOn>(filters)
  }

  async getProductAddOnById(id: string): Promise<Result<ProductAddOn>> {
    return this.getById<ProductAddOn>(id)
  }

  async createProductAddOn(data: CreateProductAddOnRequest): Promise<Result<string>> {
    const response = await api.post<Result<string>>(this.endpoint, data)
    return response.data
  }

  async updateProductAddOn(id: string, data: UpdateProductAddOnRequest): Promise<Result<void>> {
    const response = await api.put<Result<void>>(`${this.endpoint}/${id}`, data)
    return response.data
  }

  async deleteProductAddOn(id: string): Promise<Result<void>> {
    return this.delete<void>(id)
  }
}

export const productAddOnService = new ProductAddOnService()
