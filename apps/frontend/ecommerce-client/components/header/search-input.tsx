"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { Search, X, Clock, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSearchSuggestions } from "@/hooks/use-search-suggestions"
import { useRouter } from "next/navigation"

const SEARCH_HISTORY_KEY = "ecommerce_search_history"
const MAX_HISTORY_ITEMS = 10

export function SearchInput() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [debouncedQuery, setDebouncedQuery] = useState("")
    const [searchHistory, setSearchHistory] = useState<string[]>([])
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [, setRetryCount] = useState(0)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    // Load search history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(SEARCH_HISTORY_KEY)
        if (saved) {
            setSearchHistory(JSON.parse(saved))
        }
    }, [])

    // Sử dụng debounce riêng để kiểm soát khi nào gọi API
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery)
            setSelectedIndex(-1)
        }, 300) // 300ms debounce time

        return () => {
            clearTimeout(timer)
        }
    }, [searchQuery])

    // Lấy dữ liệu gợi ý từ API với retry logic
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

    const submitSearch = useCallback((text: string) => {
        const query = text.trim()
        if (!query) return

        const params = new URLSearchParams()
        params.set("q", query)
        router.push(`/products?${params.toString()}`)
    }, [router])

    const handleSelectSuggestion = useCallback((text: string) => {
        // Add to history
        const updated = [text, ...searchHistory.filter((h) => h !== text)].slice(0, MAX_HISTORY_ITEMS)
        setSearchHistory(updated)
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated))

        setSearchQuery(text)
        setShowSuggestions(false)
        setDebouncedQuery(text)
        submitSearch(text)
    }, [searchHistory, submitSearch])

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!showSuggestions) return

            if (e.key === "ArrowDown") {
                e.preventDefault()
                setSelectedIndex((prev) => prev + 1)
            } else if (e.key === "ArrowUp") {
                e.preventDefault()
                setSelectedIndex((prev) => (prev <= 0 ? -1 : prev - 1))
            } else if (e.key === "Enter" && selectedIndex >= 0) {
                e.preventDefault()
                const allSuggestions = [...searchHistory, ...apiSuggestions]
                const selected = allSuggestions[selectedIndex]
                if (selected) {
                    const text = typeof selected === "string" ? selected : selected.text
                    handleSelectSuggestion(text)
                }
            } else if (e.key === "Escape") {
                setShowSuggestions(false)
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [showSuggestions, selectedIndex, searchHistory, apiSuggestions, handleSelectSuggestion])

    const handleClearSearch = () => {
        setSearchQuery("")
        setShowSuggestions(false)
        refetchSuggestions()
    }

    const handleClearHistory = () => {
        setSearchHistory([])
        localStorage.removeItem(SEARCH_HISTORY_KEY)
    }

    const handleRetry = () => {
        setRetryCount((prev) => prev + 1)
        refetchSuggestions()
    }

    // Combine suggestions with history
    const displaySuggestions = debouncedQuery ? apiSuggestions : []
    const allItems = debouncedQuery ? displaySuggestions : searchHistory

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
                onKeyDown={(e) => {
                    if (e.key === "Enter" && selectedIndex < 0) {
                        e.preventDefault()
                        handleSelectSuggestion(searchQuery)
                    }
                }}
                onFocus={() => {
                    if (!searchQuery && searchHistory.length > 0) {
                        setShowSuggestions(true)
                    } else if (searchQuery) {
                        setShowSuggestions(true)
                    }
                }}
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
                <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground rounded-2xl shadow-xl z-50 border border-border overflow-hidden"
                >
                    {suggestionsLoading ? (
                        <div className="p-4 space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex space-x-3 items-center">
                                    <div className="h-8 w-8 bg-muted rounded-md animate-pulse"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                                        <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : suggestionsError ? (
                        <div className="p-4 space-y-2">
                            <p className="text-destructive font-medium text-sm">Không thể tải gợi ý</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRetry}
                                className="w-full gap-2"
                            >
                                <RotateCcw className="h-3 w-3" />
                                Thử lại
                            </Button>
                        </div>
                    ) : allItems.length > 0 ? (
                        <div className="max-h-80 overflow-y-auto">
                            {/* History section */}
                            {!debouncedQuery && searchHistory.length > 0 && (
                                <>
                                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground sticky top-0 bg-secondary/20">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                <Clock className="h-3 w-3" />
                                                Lịch sử tìm kiếm
                                            </span>
                                            <button
                                                onClick={handleClearHistory}
                                                className="text-destructive hover:text-destructive/80 text-xs"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                    {searchHistory.map((item, idx) => (
                                        <button
                                            key={`history-${idx}`}
                                            onClick={() => handleSelectSuggestion(item)}
                                            className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                                selectedIndex === idx ? "bg-accent" : "hover:bg-accent/50"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                {item}
                                            </div>
                                        </button>
                                    ))}
                                </>
                            )}

                            {/* Suggestions section */}
                            {displaySuggestions.length > 0 && (
                                <>
                                    {!debouncedQuery && (
                                        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground sticky top-0 bg-secondary/20">
                                            Gợi ý
                                        </div>
                                    )}
                                    {displaySuggestions.map((suggestion, idx) => (
                                        <button
                                            key={`suggestion-${idx}`}
                                            onClick={() => handleSelectSuggestion(suggestion.text)}
                                            className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                                selectedIndex === idx + searchHistory.length ? "bg-accent" : "hover:bg-accent/50"
                                            }`}
                                        >
                                            <div className="font-medium text-foreground">{suggestion.text}</div>
                                            {suggestion.categoryName && (
                                                <div className="text-xs text-muted-foreground">{suggestion.categoryName}</div>
                                            )}
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            {debouncedQuery ? "Không tìm thấy kết quả" : "Bắt đầu nhập để tìm kiếm"}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
