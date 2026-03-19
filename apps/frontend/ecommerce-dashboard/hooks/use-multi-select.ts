"use client"

import * as React from "react"
import type { OptionType } from "@/components/ui/select/multi-select"

export interface UseMultiSelectOptions<T = string> {
    defaultValues?: T[]
    maxSelections?: number
    onSelectionChange?: (values: T[]) => void
    onMaxReached?: () => void
}

export function useMultiSelect<T = string>({
    defaultValues = [],
    maxSelections,
    onSelectionChange,
    onMaxReached,
}: UseMultiSelectOptions<T> = {}) {
    const [values, setValues] = React.useState<T[]>(defaultValues)

    const handleChange = React.useCallback(
        (newValues: T[]) => {
            if (maxSelections && newValues.length > maxSelections) {
                onMaxReached?.()
                return
            }

            setValues(newValues)
            onSelectionChange?.(newValues)
        },
        [maxSelections, onSelectionChange, onMaxReached],
    )

    const addValue = React.useCallback(
        (value: T) => {
            if (values.includes(value)) return

            if (maxSelections && values.length >= maxSelections) {
                onMaxReached?.()
                return
            }

            const newValues = [...values, value]
            setValues(newValues)
            onSelectionChange?.(newValues)
        },
        [values, maxSelections, onSelectionChange, onMaxReached],
    )

    const removeValue = React.useCallback(
        (value: T) => {
            const newValues = values.filter((v) => v !== value)
            setValues(newValues)
            onSelectionChange?.(newValues)
        },
        [values, onSelectionChange],
    )

    const clearAll = React.useCallback(() => {
        setValues([])
        onSelectionChange?.([])
    }, [onSelectionChange])

    const toggleValue = React.useCallback(
        (value: T) => {
            if (values.includes(value)) {
                removeValue(value)
            } else {
                addValue(value)
            }
        },
        [values, addValue, removeValue],
    )

    const isSelected = React.useCallback(
        (value: T) => {
            return values.includes(value)
        },
        [values],
    )

    const getSelectedOptions = React.useCallback(
        (options: OptionType<T>[]) => {
            return options.filter((option) => values.includes(option.value))
        },
        [values],
    )

    return {
        values,
        setValues: handleChange,
        addValue,
        removeValue,
        clearAll,
        toggleValue,
        isSelected,
        getSelectedOptions,
        selectedCount: values.length,
        canAddMore: !maxSelections || values.length < maxSelections,
    }
}
