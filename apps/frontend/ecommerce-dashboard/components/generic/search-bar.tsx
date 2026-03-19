"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import type { FilterField } from "@/types/list-config"

interface SearchBarProps {
    searchField: FilterField
    initialValue: string
    onSearch: (value: string) => void
    placeholder?: string
}

export function SearchBar({ searchField, initialValue = "", onSearch, placeholder }: SearchBarProps) {
    const [searchTerm, setSearchTerm] = useState(initialValue)

    // Update local state when initialValue changes
    useEffect(() => {
        setSearchTerm(initialValue)
    }, [initialValue])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch(searchTerm)
    }

    return (
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder={placeholder || searchField.placeholder || `Nhập từ khóa ...`}
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button type="submit">Tìm kiếm</Button>
        </form>
    )
}
