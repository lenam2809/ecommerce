"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { MultiSelect, type OptionType } from "@/components/ui/select/multi-select"
import { FormMultiSelect } from "@/components/ui/select/form-multi-select"
import { useMultiSelect } from "@/hooks/use-multi-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Building, MapPin, Star, Code, Database, Globe } from "lucide-react"

// Sample data
const frameworks: OptionType<string>[] = [
    { value: "react", label: "React", icon: <Code className="h-4 w-4" /> },
    { value: "vue", label: "Vue.js", icon: <Code className="h-4 w-4" /> },
    { value: "angular", label: "Angular", icon: <Code className="h-4 w-4" /> },
    { value: "svelte", label: "Svelte", icon: <Code className="h-4 w-4" /> },
    { value: "nextjs", label: "Next.js", icon: <Globe className="h-4 w-4" /> },
    { value: "nuxt", label: "Nuxt.js", icon: <Globe className="h-4 w-4" /> },
]

const databases: OptionType<string>[] = [
    { value: "postgresql", label: "PostgreSQL", icon: <Database className="h-4 w-4" /> },
    { value: "mysql", label: "MySQL", icon: <Database className="h-4 w-4" /> },
    { value: "mongodb", label: "MongoDB", icon: <Database className="h-4 w-4" /> },
    { value: "redis", label: "Redis", icon: <Database className="h-4 w-4" /> },
    { value: "sqlite", label: "SQLite", icon: <Database className="h-4 w-4" /> },
]

const features: OptionType<string>[] = [
    {
        value: "user",
        label: "User Management",
        icon: <User className="h-4 w-4" />,
        description: "Manage user accounts and permissions",
    },
    {
        value: "company",
        label: "Company Settings",
        icon: <Building className="h-4 w-4" />,
        description: "Configure company-wide settings",
    },
    {
        value: "location",
        label: "Location Services",
        icon: <MapPin className="h-4 w-4" />,
        description: "GPS and location-based features",
    },
    {
        value: "premium",
        label: "Premium Features",
        icon: <Star className="h-4 w-4" />,
        description: "Advanced premium functionality",
    },
]

// Form schema
const formSchema = z.object({
    frameworks: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một framework"),
    databases: z.array(z.string()).max(3, "Vui lòng chọn tối đa 3 database"),
    features: z.array(z.string()),
})

type FormData = z.infer<typeof formSchema>

export default function MultiSelectDemo() {
    // Standalone usage
    const [standaloneValues, setStandaloneValues] = useState<string[]>(["react"])

    // Hook usage
    const {
        values: hookValues,
        setValues: setHookValues,
        addValue,
        removeValue,
        clearAll,
        selectedCount,
        canAddMore,
    } = useMultiSelect<string>({
        defaultValues: ["vue"],
        maxSelections: 3,
        onMaxReached: () => alert("Maximum 3 selections allowed!"),
    })

    // Form usage
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            frameworks: [],
            databases: [],
            features: [],
        },
    })

    const onSubmit = (data: FormData) => {
        console.log("Form submitted:", data)
        alert(JSON.stringify(data, null, 2))
    }

    // Async search simulation
    const [asyncOptions, setAsyncOptions] = useState<OptionType<string>[]>(frameworks)
    const [isLoading, setIsLoading] = useState(false)

    const handleAsyncSearch = async (query: string) => {
        if (!query) {
            setAsyncOptions(frameworks)
            return
        }

        setIsLoading(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800))

        const filtered = frameworks.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))

        setAsyncOptions(filtered)
        setIsLoading(false)
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Enhanced MultiSelect Demo</h1>
                <p className="text-muted-foreground mt-2">Comprehensive showcase of all MultiSelect features</p>
            </div>

            {/* Standalone Usage */}
            <Card>
                <CardHeader>
                    <CardTitle>1. Standalone Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <MultiSelect
                        options={frameworks}
                        values={standaloneValues}
                        onChange={setStandaloneValues}
                        placeholder="Select frameworks..."
                        searchPlaceholder="Search frameworks..."
                        maxDisplayedTags={2}
                        clearable
                        searchable
                    />
                    <div className="text-sm text-muted-foreground">Selected: {standaloneValues.join(", ") || "None"}</div>
                </CardContent>
            </Card>

            {/* Hook Usage */}
            <Card>
                <CardHeader>
                    <CardTitle>2. Hook Usage (Max 3 selections)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <MultiSelect
                        options={frameworks}
                        values={hookValues}
                        onChange={setHookValues}
                        placeholder="Select up to 3 frameworks..."
                        maxDisplayedTags={3}
                    />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addValue("angular")}
                            disabled={!canAddMore || hookValues.includes("angular")}
                        >
                            Add Angular
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeValue("vue")}
                            disabled={!hookValues.includes("vue")}
                        >
                            Remove Vue
                        </Button>
                        <Button size="sm" variant="outline" onClick={clearAll}>
                            Clear All
                        </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Selected: {selectedCount}/3 - {hookValues.join(", ") || "None"}
                    </div>
                </CardContent>
            </Card>

            {/* Custom Rendering */}
            <Card>
                <CardHeader>
                    <CardTitle>3. Custom Rendering</CardTitle>
                </CardHeader>
                <CardContent>
                    <MultiSelect
                        options={features}
                        values={[]}
                        onChange={() => { }}
                        placeholder="Select features with custom rendering..."
                        renderOption={(option, isSelected) => (
                            <div className="flex items-start gap-3 py-1">
                                {option.icon}
                                <div className="flex-1">
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-sm text-muted-foreground">{option.description}</div>
                                </div>
                                {isSelected && <Badge variant="secondary">Selected</Badge>}
                            </div>
                        )}
                        renderTag={(option, onRemove) => (
                            <Badge variant="outline" className="gap-1 pr-1">
                                {option.icon}
                                {option.label}
                                <Button size="sm" variant="ghost" className="h-4 w-4 p-0 hover:bg-muted" onClick={onRemove}>
                                    ×
                                </Button>
                            </Badge>
                        )}
                    />
                </CardContent>
            </Card>

            {/* Async Search */}
            <Card>
                <CardHeader>
                    <CardTitle>4. Async Search (Debounced)</CardTitle>
                </CardHeader>
                <CardContent>
                    <MultiSelect
                        options={asyncOptions}
                        values={[]}
                        onChange={() => { }}
                        onSearch={handleAsyncSearch}
                        isLoading={isLoading}
                        placeholder="Search frameworks with async loading..."
                        searchDebounceMs={500}
                        loadingMessage="Searching frameworks..."
                    />
                </CardContent>
            </Card>

            {/* Form Integration */}
            <Card>
                <CardHeader>
                    <CardTitle>5. Form Integration with Validation</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormMultiSelect
                                name="frameworks"
                                label="Preferred Frameworks *"
                                description="Select at least one framework you work with"
                                options={frameworks}
                                rules={{
                                    required: "Please select at least one framework",
                                    minLength: { value: 1, message: "Select at least 1 framework" },
                                }}
                            />

                            <FormMultiSelect
                                name="databases"
                                label="Databases (Max 3)"
                                description="Select up to 3 databases you use"
                                options={databases}
                                rules={{
                                    maxLength: { value: 3, message: "Select at most 3 databases" },
                                }}
                                maxDisplayedTags={3}
                            />

                            <FormMultiSelect
                                name="features"
                                label="Optional Features"
                                description="Select any additional features you need"
                                options={features}
                                maxDisplayedTags={2}
                            />

                            <div className="flex gap-2">
                                <Button type="submit">Submit Form</Button>
                                <Button type="button" variant="outline" onClick={() => form.reset()}>
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </FormProvider>
                </CardContent>
            </Card>

            {/* Virtual Scrolling */}
            <Card>
                <CardHeader>
                    <CardTitle>6. Virtual Scrolling (Large Dataset)</CardTitle>
                </CardHeader>
                <CardContent>
                    <MultiSelect
                        options={Array.from({ length: 1000 }, (_, i) => ({
                            value: `item-${i}`,
                            label: `Item ${i + 1}`,
                            description: `Description for item ${i + 1}`,
                        }))}
                        values={[]}
                        onChange={() => { }}
                        placeholder="Select from 1000 items with virtual scrolling..."
                        virtualScrolling={true}
                        virtualScrollingThreshold={50}
                        searchable={true}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
