"use client"
import { useFormContext } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { SingleSelect, type SingleSelectProps } from "@/components/ui/select/single-select"

interface FormSingleSelectProps<T> extends Omit<SingleSelectProps<T>, "value" | "onChange"> {
    control?: any // eslint-disable-line @typescript-eslint/no-explicit-any
    name: string
    label?: string
    description?: string
}

export function FormSingleSelect<T = string>({ control, name, label, description, ...props }: FormSingleSelectProps<T>) {

    const { control: formControl } = useFormContext()
    const controlProps = control || formControl
    return (
        <FormField
            control={controlProps}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <SingleSelect {...props} value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormDescription>
                        {description || "Chọn một giá trị từ danh sách"}
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

