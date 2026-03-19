"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FilterFieldComponent } from "./filter-field"
import type { ListConfig, SearchParams, DataItem } from "@/types/list-config"

interface AdvancedSearchProps<T extends DataItem> {
    config: ListConfig<T>
    initialValues: SearchParams
    onSearch: (params: Partial<SearchParams>) => void
}

export function AdvancedSearch<T extends DataItem>({ config, initialValues, onSearch }: AdvancedSearchProps<T>) {
    const [formValues, setFormValues] = useState<SearchParams>(initialValues)

    // Get only advanced filter fields
    const advancedFields = config.filterFields.filter((field) => field.isAdvanced)

    // Update local state when initialValues change
    useEffect(() => {
        setFormValues(initialValues)
    }, [initialValues])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch(formValues)
    }

    const handleReset = () => {
        const resetValues: Partial<SearchParams> = {}

        // Reset each field to its default value
        advancedFields.forEach((field) => {
            resetValues[field.id] = field.defaultValue
        })

        setFormValues((prev) => ({ ...prev, ...resetValues }))
        onSearch(resetValues)
    }

    const handleFieldChange = (id: string, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        setFormValues((prev) => ({
            ...prev,
            [id]: value,
        }))
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {advancedFields.map((field) => (
                            <FilterFieldComponent
                                key={field.id}
                                field={field}
                                value={formValues[field.id]}
                                onChange={handleFieldChange}
                            />
                        ))}
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={handleReset}>
                            Làm mới
                        </Button>
                        <Button type="submit">Áp dụng</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
