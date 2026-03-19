"use client"
import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useSearchSuggestions } from "@/hooks/use-search-suggestions"
import { SearchSuggestion } from "@/types/search-suggestion"
import SearchSuggestions from "../search-suggestions"

export function SearchInput() {
    const [searchQuery, setSearchQuery] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [debouncedQuery, setDebouncedQuery] = useState("")
    const searchInputRef = useRef<HTMLInputElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    // Sử dụng debounce riêng để kiểm soát khi nào gọi API
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery)
        }, 300) // 300ms debounce time

        return () => {
            clearTimeout(timer)
        }
    }, [searchQuery])

    // Lấy dữ liệu gợi ý từ API
    const {
        data: apiSuggestions = [],
        isLoading: suggestionsLoading,
        isError: suggestionsError,
        refetch: refetchSuggestions,
    } = useSearchSuggestions(debouncedQuery)

    // Xử lý click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target as Node) &&
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
        setSearchQuery(suggestion.text)
        setShowSuggestions(false)
        searchInputRef.current?.focus()
    }

    const handleClearSearch = () => {
        setSearchQuery("")
        refetchSuggestions()
    }

    return (
        <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-11 pr-10 py-2 h-10 w-full rounded-full bg-secondary/50 border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
            />

            {searchQuery && (
                <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground h-6 w-6 flex items-center justify-center rounded-full hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={handleClearSearch}
                    aria-label="Xóa tìm kiếm"
                >
                    <X className="h-4 w-4" />
                </button>
            )}

            {showSuggestions && (
                <>
                    {suggestionsLoading ? (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground rounded-2xl shadow-xl z-50 border border-border p-4">
                            <div className="animate-pulse space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex space-x-3 items-center">
                                        <div className="h-8 w-8 bg-muted rounded-md"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-muted rounded w-3/4"></div>
                                            <div className="h-3 bg-muted rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : suggestionsError ? (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-popover text-destructive font-medium rounded-2xl shadow-xl z-50 border border-border p-4">
                            Lỗi khi tải gợi ý
                        </div>
                    ) : (
                        <SearchSuggestions
                            ref={suggestionsRef}
                            suggestions={apiSuggestions}
                            onSelect={handleSelectSuggestion}
                        />
                    )}
                </>
            )}
        </div>
    )
}