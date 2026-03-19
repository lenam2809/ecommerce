"use client"

import * as React from "react"
import { useFormContext, type Control, type FieldValues, type Path } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { MultiSelect, type MultiSelectProps } from "./multi-select"

export interface FormMultiSelectProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
    TValue = string,
> extends Omit<MultiSelectProps<TValue>, "values" | "onChange" | "defaultValues"> {
    // Form-specific props
    control?: Control<TFieldValues>
    name: TName
    label?: string
    description?: string

    // Validation rules (compatible with react-hook-form)
    rules?: {
        required?: boolean | string
        minLength?: number | { value: number; message: string }
        maxLength?: number | { value: number; message: string }
        validate?: (value: TValue[]) => boolean | string
        custom?: (value: TValue[]) => boolean | string
    }

    // Transform functions
    transformValue?: (value: any) => TValue[] // eslint-disable-line @typescript-eslint/no-explicit-any
    transformOutput?: (value: TValue[]) => any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function FormMultiSelect<
    TFieldValues extends FieldValues = FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
    TValue = string,
>({
    control,
    name,
    label,
    description,
    rules,
    transformValue,
    transformOutput,
    ...props
}: FormMultiSelectProps<TFieldValues, TName, TValue>) {
    const { control: formControl } = useFormContext<TFieldValues>()
    const controlToUse = control || formControl

    // Build validation rules
    const validationRules = React.useMemo(() => {
        const baseRules: any = {} // eslint-disable-line @typescript-eslint/no-explicit-any

        if (rules?.required) {
            baseRules.required = typeof rules.required === "string" ? rules.required : "Trường này là bắt buộc"
        }

        if (rules?.minLength) {
            const minLength = typeof rules.minLength === "number" ? rules.minLength : rules.minLength.value
            const message =
                typeof rules.minLength === "object" ? rules.minLength.message : `Vui lòng chọn ít nhất ${minLength} tùy chọn`

            baseRules.validate = {
                ...baseRules.validate,
                minLength: (value: TValue[]) => !value || value.length >= minLength || message,
            }
        }

        if (rules?.maxLength) {
            const maxLength = typeof rules.maxLength === "number" ? rules.maxLength : rules.maxLength.value
            const message =
                typeof rules.maxLength === "object" ? rules.maxLength.message : `Vui lòng chọn tối đa ${maxLength} tùy chọn`

            baseRules.validate = {
                ...baseRules.validate,
                maxLength: (value: TValue[]) => !value || value.length <= maxLength || message,
            }
        }

        if (rules?.validate) {
            baseRules.validate = {
                ...baseRules.validate,
                custom: rules.validate,
            }
        }

        if (rules?.custom) {
            baseRules.validate = {
                ...baseRules.validate,
                customRule: rules.custom,
            }
        }

        return baseRules
    }, [rules])

    if (!controlToUse) {
        throw new Error("FormMultiSelect must be used within a FormProvider or have control prop passed")
    }

    return (
        <FormField
            control={controlToUse}
            name={name}
            rules={validationRules}
            render={({ field, fieldState }) => {
                // Transform the value for display
                const displayValue = transformValue ? transformValue(field.value) : field.value || []

                // Handle value change
                const handleChange = (newValue: TValue[]) => {
                    const outputValue = transformOutput ? transformOutput(newValue) : newValue
                    field.onChange(outputValue)
                }

                return (
                    <FormItem>
                        {label && <FormLabel>{label}</FormLabel>}
                        <FormControl>
                            <MultiSelect<TValue>
                                {...props}
                                values={displayValue}
                                onChange={handleChange}
                                aria-describedby={fieldState.error ? `${name}-error` : undefined}
                                className={fieldState.error ? "border-destructive" : props.className}
                            />
                        </FormControl>
                        {description && <FormDescription>{description}</FormDescription>}
                        <FormMessage id={`${name}-error`} />
                    </FormItem>
                )
            }}
        />
    )
}

// Type-safe wrapper for common use cases
export function FormMultiSelectString<
    TFieldValues extends FieldValues = FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
>(props: FormMultiSelectProps<TFieldValues, TName, string>) {
    return <FormMultiSelect<TFieldValues, TName, string> {...props} />
}

export function FormMultiSelectNumber<
    TFieldValues extends FieldValues = FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
>(props: FormMultiSelectProps<TFieldValues, TName, number>) {
    return <FormMultiSelect<TFieldValues, TName, number> {...props} />
}
