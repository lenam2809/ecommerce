"use client"
/* eslint-disable react-hooks/rules-of-hooks */

import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { MultiSelect, type OptionType } from "./multi-select"
import { FormMultiSelect } from "./form-multi-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, User, Building, MapPin } from "lucide-react"

const meta: Meta<typeof MultiSelect> = {
    title: "Components/MultiSelect",
    component: MultiSelect,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof MultiSelect>

// Sample data
const basicOptions: OptionType<string>[] = [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue.js" },
    { value: "angular", label: "Angular" },
    { value: "svelte", label: "Svelte" },
    { value: "nextjs", label: "Next.js" },
    { value: "nuxt", label: "Nuxt.js" },
]

const optionsWithIcons: OptionType<string>[] = [
    { value: "user", label: "User Management", icon: <User className="h-4 w-4" /> },
    { value: "company", label: "Company Settings", icon: <Building className="h-4 w-4" /> },
    { value: "location", label: "Location Services", icon: <MapPin className="h-4 w-4" /> },
    { value: "premium", label: "Premium Features", icon: <Star className="h-4 w-4" /> },
]

const largeOptionsList: OptionType<number>[] = Array.from({ length: 150 }, (_, i) => ({
    value: i + 1,
    label: `Lựa chọn ${i + 1}`,
    description: `Mô tả cho tùy chọn ${i + 1}`,
}))

// Basic usage
export const Basic: Story = {
    render: () => {
        const [values, setValues] = useState<string[]>([])

        return (
            <div className="w-[400px]">
                <MultiSelect options={basicOptions} values={values} onChange={setValues} placeholder="Select frameworks..." />
                <div className="mt-4 text-sm text-muted-foreground">Đã chọn: {values.join(", ") || "None"}</div>
            </div>
        )
    },
}

// With custom rendering
export const CustomRendering: Story = {
    render: () => {
        const [values, setValues] = useState<string[]>([])

        return (
            <div className="w-[400px]">
                <MultiSelect
                    options={optionsWithIcons}
                    values={values}
                    onChange={setValues}
                    placeholder="Select features..."
                    renderOption={(option, isSelected) => (
                        <div className="flex items-center gap-2">
                            {option.icon}
                            <span>{option.label}</span>
                            {isSelected && (
                                <Badge variant="secondary" className="ml-auto">
                                    Selected
                                </Badge>
                            )}
                        </div>
                    )}
                    renderTag={(option, onRemove) => (
                        <Badge variant="outline" className="gap-1">
                            {option.icon}
                            {option.label}
                            <button onClick={onRemove} className="ml-1 hover:bg-muted rounded-full p-0.5">
                                ×
                            </button>
                        </Badge>
                    )}
                />
            </div>
        )
    },
}

// Virtual scrolling
export const VirtualScrolling: Story = {
    render: () => {
        const [values, setValues] = useState<number[]>([])

        return (
            <div className="w-[400px]">
                <MultiSelect
                    options={largeOptionsList}
                    values={values}
                    onChange={setValues}
                    placeholder="Select from 150 options..."
                    virtualScrolling={true}
                    virtualScrollingThreshold={50}
                />
                <div className="mt-4 text-sm text-muted-foreground">Selected {values.length} items</div>
            </div>
        )
    },
}

// Async search
export const AsyncSearch: Story = {
    render: () => {
        const [values, setValues] = useState<string[]>([])
        const [options, setOptions] = useState<OptionType<string>[]>(basicOptions)
        const [isLoading, setIsLoading] = useState(false)

        const handleSearch = async (query: string) => {
            if (!query) {
                setOptions(basicOptions)
                return
            }

            setIsLoading(true)

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500))

            const filtered = basicOptions.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))

            setOptions(filtered)
            setIsLoading(false)
        }

        return (
            <div className="w-[400px]">
                <MultiSelect
                    options={options}
                    values={values}
                    onChange={setValues}
                    onSearch={handleSearch}
                    isLoading={isLoading}
                    placeholder="Search frameworks..."
                    searchDebounceMs={300}
                />
            </div>
        )
    },
}

// Form integration
const formSchema = z.object({
    frameworks: z.array(z.string()).min(1, "Please select at least one framework"),
    features: z.array(z.string()).max(3, "Please select at most 3 features"),
})

type FormData = z.infer<typeof formSchema>

export const FormIntegration: Story = {
    render: () => {
        const form = useForm<FormData>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                frameworks: [],
                features: [],
            },
        })

        const onSubmit = (data: FormData) => {
            alert(JSON.stringify(data, null, 2))
        }

        return (
            <FormProvider {...form}>
                <Card className="w-[500px]">
                    <CardHeader>
                        <CardTitle>Developer Preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormMultiSelect
                                name="frameworks"
                                label="Preferred Frameworks"
                                description="Select the frameworks you work with"
                                options={basicOptions}
                                rules={{
                                    required: "Please select at least one framework",
                                    minLength: { value: 1, message: "Select at least 1 framework" },
                                }}
                            />

                            <FormMultiSelect
                                name="features"
                                label="Required Features"
                                description="Select up to 3 features"
                                options={optionsWithIcons}
                                maxDisplayedTags={2}
                                rules={{
                                    maxLength: { value: 3, message: "Select at most 3 features" },
                                }}
                            />

                            <Button type="submit" className="w-full">
                                Submit Preferences
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </FormProvider>
        )
    },
}

// All features showcase
export const AllFeatures: Story = {
    render: () => {
        const [values, setValues] = useState<string[]>(["react"])

        return (
            <div className="w-[500px] space-y-4">
                <MultiSelect
                    options={basicOptions}
                    values={values}
                    onChange={setValues}
                    placeholder="Select frameworks..."
                    searchPlaceholder="Search frameworks..."
                    emptySearchMessage="No frameworks found"
                    maxDisplayedTags={2}
                    searchable={true}
                    clearable={true}
                    closeOnSelect={false}
                    searchDebounceMs={200}
                    className="border-2"
                    triggerClassName="min-h-[50px]"
                    tagClassName="bg-primary text-primary-foreground"
                />

                <div className="text-sm text-muted-foreground">
                    Features enabled: searchable, clearable, debounced search (200ms), custom styling
                </div>
            </div>
        )
    },
}
