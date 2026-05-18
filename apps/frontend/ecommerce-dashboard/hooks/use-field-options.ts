import { logger } from '@/lib/logger'
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import { OptionType } from "@/components/ui/select/single-select"

export function useFieldOptions(
    endpoint?: string,
    valueField: string = "value",
    labelField: string = "label"
) {
    return useQuery<OptionType[]>({
        queryKey: ["fieldOptions", endpoint],
        queryFn: async () => {
            if (!endpoint) return []

            try {
                const res = await api.get(`/${endpoint}`)

                // Ensure we have data to process
                const items = res.data.data?.items || res.data.data || []

                if (!Array.isArray(items)) {
                    logger.error("API response is not an array:", items)
                    return []
                }

                // Map the items to option format
                return items.map((item: any) => ({
                    value: item[valueField]?.toString() || "",
                    label: item[labelField] || "Không xác định",
                }))
            } catch (error) {
                logger.error("Error fetching options:", error)
                return []
            }
        },
        // Only execute if endpoint is provided
        enabled: !!endpoint,
    })
}