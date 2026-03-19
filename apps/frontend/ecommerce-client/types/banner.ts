export interface Banner {
    id: string
    title: string
    description: string
    imageUrl: string
    buttonText: string
    buttonLink: string
    isActive: boolean
    order: number
    createdAt: string
    updatedAt: string
}

export interface BannersResponse {
    banners: Banner[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface BannerFilters {
    isActive?: boolean
    page?: number
    limit?: number
    search?: string
}
