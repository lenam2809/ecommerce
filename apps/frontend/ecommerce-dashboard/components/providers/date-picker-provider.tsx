"use client"

import * as React from "react"
import { createContext, useContext } from "react"

export interface DatePickerTheme {
    accentColor: string
    textColor: string
    backgroundColor: string
    selectionColor: string
    todayColor: string
    fontSize: string
    borderRadius: string
}

const defaultTheme: DatePickerTheme = {
    accentColor: "hsl(var(--primary))",
    textColor: "hsl(var(--foreground))",
    backgroundColor: "hsl(var(--background))",
    selectionColor: "hsl(var(--primary))",
    todayColor: "hsl(var(--accent))",
    fontSize: "0.875rem",
    borderRadius: "0.5rem",
}

interface DatePickerContextType {
    theme: DatePickerTheme
    setTheme: React.Dispatch<React.SetStateAction<DatePickerTheme>>
}

const DatePickerContext = createContext<DatePickerContextType | undefined>(undefined)

export function DatePickerProvider({
    children,
    theme: initialTheme,
}: { children: React.ReactNode; theme?: Partial<DatePickerTheme> }) {
    const [theme, setTheme] = React.useState<DatePickerTheme>({
        ...defaultTheme,
        ...initialTheme,
    })

    return <DatePickerContext.Provider value={{ theme, setTheme }}>{children}</DatePickerContext.Provider>
}

export function useDatePickerTheme() {
    const context = useContext(DatePickerContext)
    if (context === undefined) {
        return { theme: defaultTheme, setTheme: () => { } }
    }
    return context
}
