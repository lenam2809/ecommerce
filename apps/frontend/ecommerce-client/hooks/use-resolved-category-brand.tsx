import {
    useCategoryBySlug,
    useCategories,
} from "@/hooks/use-categories"
import {
    useBrandBySlug,
    useBrandsByCategoryId,
    useBrands,
} from "@/hooks/use-brands"

export function useResolvedCategoryBrand(categorySlug?: string, brandSlug?: string) {
    // 1. Lấy category theo slug nếu có
    const { data: category } = useCategoryBySlug(categorySlug ?? '')

    // 2. Lấy brand theo slug nếu có (1 brand)
    const { data: brandBySlug } = useBrandBySlug(brandSlug ?? '')

    // 3. Lấy danh sách brands theo categoryId (mảng brands)
    const { data: brandsByCategory } = useBrandsByCategoryId(category?.id ?? '')

    // 4. Lấy toàn bộ categories và brands
    const { data: categoriesData } = useCategories()
    const { data: brandsData } = useBrands()

    // 5. Xác định brand hoặc brands:
    // Nếu có brandSlug thì trả về brandBySlug (1 brand)
    // Nếu không có brandSlug mà có category thì trả về brandsByCategory (mảng)
    // Nếu không có categorySlug thì trả về toàn bộ brandsData (mảng)
    const brand = brandSlug ? brandBySlug : undefined
    const brands = brandSlug ? (brandBySlug ? [brandBySlug] : [])
        : (category ? (brandsByCategory ?? []) : (brandsData ?? []))

    // 6. Xác định danh sách categories (1 phần tử hoặc toàn bộ)
    const categories = category ? [category] : (categoriesData ?? [])

    return {
        category,
        brand,
        categories,
        brands,
    }
}
