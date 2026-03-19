import { useQuery } from "@tanstack/react-query"
import type { ListConfig, SearchParams, ListResponse, DataItem } from "@/types/list-config"
import api from "@/lib/axios"

export function useListData<T extends DataItem>(config: ListConfig<T>, params: SearchParams) {
    return useQuery<ListResponse<T>>({
        queryKey: [config.id, params],
        queryFn: async () => {
            // Convert params to API parameters based on filter field configurations
            const apiParams: Record<string, any> = {
                pageNumber: params.pageNumber,
                pageSize: params.pageSize,
            }

            // Add sort parameters
            const sortOption = config.sortOptions.find((option) => option.id === params.sortBy)
            if (sortOption) {
                apiParams[sortOption.apiParam || "sortBy"] = params.sortBy
                apiParams["isDescending"] = params.isDescending
            }

            // Add filter parameters
            config.filterFields.forEach((field) => {
                const value = params[field.id];
                if (value !== undefined && value !== null && value !== "") {
                    // Handle array values (like multiselect)
                    if (Array.isArray(value) && value.length > 0) {
                        // Handle range values specifically
                        if (field.type === "range" && value.length === 2) {
                            const minValue = value[0];
                            const maxValue = value[1];

                            // Ensure values are valid
                            if (minValue !== null && minValue !== undefined) {
                                // For price filter, use explicit MinPrice and MaxPrice parameters
                                if (field.apiParam === "price") {
                                    apiParams["MinPrice"] = minValue;
                                } else {
                                    apiParams[`min${field.apiParam || field.id.charAt(0).toUpperCase() + field.id.slice(1)}`] = minValue;
                                }
                            }

                            if (maxValue !== null && maxValue !== undefined) {
                                if (field.apiParam === "price") {
                                    apiParams["MaxPrice"] = maxValue;
                                } else {
                                    apiParams[`max${field.apiParam || field.id.charAt(0).toUpperCase() + field.id.slice(1)}`] = maxValue;
                                }
                            }
                        }
                        // Handle other array values (non-range type)
                        else {
                            apiParams[field.apiParam || field.id] = value.join(",");
                        }
                    }
                    // Handle regular values
                    else if (!Array.isArray(value) || value.length > 0) {
                        apiParams[field.apiParam || field.id] = value;
                    }
                }
            });

            const res = await api.get(`/${config.endpoint}`, { params: apiParams })

            const data = res.data.data;
            // Transform the response to match our expected format if needed
            const response: ListResponse<T> = {
                items: data.items || data[config.itemsName] || [],
                totalCount: data.totalCount || 0,
                pageCount: data.totalPages || 0,
                currentPage: data.pageNumber || params.pageNumber,
            }

            return response
        },
    })
}