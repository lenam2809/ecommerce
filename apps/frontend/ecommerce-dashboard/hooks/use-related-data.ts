import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import type { ListConfig, DataItem } from "@/types/list-config"

export function useRelatedData<T extends DataItem>(config: ListConfig, relatedDataKey: string) {
    const endpoint = config.relatedEndpoints?.[relatedDataKey]

    return useQuery<T[]>({
        queryKey: [config.id, relatedDataKey],
        queryFn: async () => {
            if (!endpoint) {
                return []
            }

            const { data } = await axios.get(`/api/${endpoint}`)
            return data
        },
        enabled: !!endpoint,
    })
}
