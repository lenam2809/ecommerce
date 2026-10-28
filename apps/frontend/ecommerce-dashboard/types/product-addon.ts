export type ProductAddOnType = 'ExtendedWarranty' | 'AccessoryBundle' | 'Installation'

export interface ProductAddOn {
  id: string
  productId?: string | null
  categoryId?: string | null
  brandId?: string | null
  code: string
  name: string
  description?: string | null
  addOnType: ProductAddOnType | string
  price: number
  originalPrice?: number | null
  durationMonths?: number | null
  isActive: boolean
  displayOrder: number
  product?: {
    id: string
    name: string
    code: string
  } | null
  category?: {
    id: string
    name: string
  } | null
  brand?: {
    id: string
    name: string
  } | null
}

export interface CreateProductAddOnRequest {
  productId?: string | null
  categoryId?: string | null
  brandId?: string | null
  code: string
  name: string
  description?: string | null
  addOnType: ProductAddOnType | string
  price: number
  originalPrice?: number | null
  durationMonths?: number | null
  isActive?: boolean
  displayOrder?: number
}

export interface UpdateProductAddOnRequest {
  id: string
  productId?: string | null
  categoryId?: string | null
  brandId?: string | null
  code: string
  name: string
  description?: string | null
  addOnType: ProductAddOnType | string
  price: number
  originalPrice?: number | null
  durationMonths?: number | null
  isActive?: boolean
  displayOrder?: number
}

export interface ProductAddOnFilters {
  productId?: string
  categoryId?: string
  brandId?: string
  addOnType?: string
  isActive?: boolean
}
