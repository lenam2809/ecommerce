import api from "@/lib/api"
import { Banner, BannerFilters, BannersResponse } from "@/types/banner"


const bannerService = {
    getBanners: async (filters: BannerFilters = {}): Promise<BannersResponse> => {
        const { data } = await api.get("/banner", { params: filters })
        return data
    },

    getBannerById: async (id: string): Promise<Banner> => {
        const { data } = await api.get(`/banner/${id}`)
        return data
    },

    createBanner: async (banner: Omit<Banner, "id" | "createdAt" | "updatedAt">): Promise<Banner> => {
        const { data } = await api.post("/banner", banner)
        return data
    },

    updateBanner: async (id: string, banner: Partial<Banner>): Promise<Banner> => {
        const { data } = await api.put(`/banner/${id}`, banner)
        return data
    },

    deleteBanner: async (id: string): Promise<void> => {
        await api.delete(`/banner/${id}`)
    },

    getActiveBanners: async (): Promise<Banner[]> => {
        const { data } = await api.get("/banner", { params: { isActive: true } })
        return data.banners
    },

    getAllBanners: async (): Promise<Banner[]> => {
        const { data } = await api.get("/banner")
        return data.data
    }
}

export default bannerService