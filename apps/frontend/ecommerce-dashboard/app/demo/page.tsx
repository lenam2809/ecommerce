"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { DatePicker } from "@/components/date-picker"
import { DateRangePicker } from "@/components/date-range-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { DateTimePicker } from "@/components/date-time-picker"

// Define the form schema with validation
const formSchema = z.object({
    singleDate: z.date({
        required_error: "Please select a date.",
    }),
    dateTime: z.date({
        required_error: "Please select a date and time.",
    }),
    dateRange: z
        .object({
            from: z.date({
                required_error: "Please select a start date.",
            }),
            to: z.date({
                required_error: "Please select an end date.",
            }),
        })
        .refine((data) => data.from <= data.to, {
            message: "End date must be after start date.",
            path: ["to"],
        }),
})

type FormValues = z.infer<typeof formSchema>

function DateFormExample() {
    // Initialize the form with default values
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            singleDate: undefined,
            dateTime: undefined,
            dateRange: {
                from: undefined,
                to: undefined,
            },
        },
    })

    // Handle form submission
    function onSubmit(data: FormValues) {
        toast({
            title: "Form submitted",
            description: (
                <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        })
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Date Input Components</CardTitle>
                <CardDescription>
                    Examples of date, datetime, and daterange input components integrated with React Hook Form.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <DatePicker
                            form={form}
                            name="singleDate"
                            label="Ngày"
                            placeholder="Chọn ngày"
                            dateFormat="dd/MM/yyyy"
                            clearable={true}
                            showTodayButton={true}
                        />

                        <DateTimePicker
                            form={form}
                            name="dateTime"
                            label="Ngày và giờ"
                            placeholder="Chọn ngày và giờ"
                            dateFormat="dd/MM/yyyy"
                            timeFormat="h:mm a"
                            minuteStep={15}
                            use24HourTime={true}
                            showTodayButton={true}
                            clearable={true}
                        />

                        <DateRangePicker
                            form={form}
                            name="dateRange"
                            label="Phạm vi ngày"
                            placeholder="Chọn ngày bắt đầu và kết thúc"
                            dateFormat="dd/MM/yyyy"
                            numberOfMonths={2}
                        />

                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}


export default function Home() {
    return (
        <main className="container py-10">
            <h1 className="text-3xl font-bold mb-8 text-center">Date Input Components</h1>
            <DateFormExample />
        </main>
    )
}
