"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, X, Clock, RotateCcw, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSearchSuggestions } from "@/hooks/use-search-suggestions"
import { useRouter } from "next/navigation"

const SEARCH_HISTORY_KEY = "ecommerce_search_history"
const MAX_HISTORY_ITEMS = 8

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
        try {
            const saved = localStorage.getItem(SEARCH_HISTORY_KEY)
            if (saved) {
                setSearchHistory(JSON.parse(saved))
            }
        } catch {
            // ignore JSON error
        }
    }, [])

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery)
            setSelectedIndex(-1)
        }, 300)

        return () => {
            clearTimeout(timer)
        }
    }, [searchQuery])

    // Fetch search suggestions
    const {
        data: apiSuggestions = [],
        isLoading: suggestionsLoading,
        isError: suggestionsError,
        refetch: refetchSuggestions,
    } = useSearchSuggestions(debouncedQuery)

    // Close on click outside
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

    // Global shortcut Cmd+K or Ctrl+K
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault()
                searchInputRef.current?.focus()
                setShowSuggestions(true)
            }
        }

        window.addEventListener("keydown", handleGlobalKeyDown)
        return () => window.removeEventListener("keydown", handleGlobalKeyDown)
    }, [])

    const submitSearch = useCallback((text: string) => {
        const query = text.trim()
        if (!query) return

        const params = new URLSearchParams()
        params.set("q", query)
        router.push(`/products?${params.toString()}`)
    }, [router])

    const handleSelectSuggestion = useCallback((text: string) => {
        const updated = [text, ...searchHistory.filter((h) => h !== text)].slice(0, MAX_HISTORY_ITEMS)
        setSearchHistory(updated)
        try {
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated))
        } catch {
            // ignore quota error
        }

        setSearchQuery(text)
        setShowSuggestions(false)
        setDebouncedQuery(text)
        submitSearch(text)
    }, [searchHistory, submitSearch])

    // Keyboard navigation in suggestions list
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
        try {
            localStorage.removeItem(SEARCH_HISTORY_KEY)
        } catch {
            // ignore
        }
    }

    const handleRetry = () => {
        setRetryCount((prev) => prev + 1)
        refetchSuggestions()
    }

    const displaySuggestions = debouncedQuery ? apiSuggestions : []
    const allItems = debouncedQuery ? displaySuggestions : searchHistory

    return (
        <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ink-faint h-4 w-4 pointer-events-none" />
            <Input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm kiếm điện thoại, laptop, phụ kiện..."
                className="pl-11 pr-16 py-2 h-10 w-full rounded-full bg-surface-2/80 hover:bg-surface-2 border border-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 transition-all text-small text-ink placeholder:text-ink-faint"
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

            {/* Shortcut hint badge */}
            {!searchQuery && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden lg:flex items-center pointer-events-none">
                    <kbd className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-sm bg-background text-ink-faint border border-line shadow-xs">
                        ⌘K
                    </kbd>
                </div>
            )}

            {searchQuery && (
                <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink-faint hover:text-ink h-6 w-6 flex items-center justify-center rounded-full hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    onClick={handleClearSearch}
                    aria-label="Xóa tìm kiếm"
                >
                    <X className="h-4 w-4" />
                </button>
            )}

            {showSuggestions && (
                <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-card text-foreground rounded-2xl shadow-xl z-50 border border-line overflow-hidden backdrop-blur-xl"
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
                                className="w-full gap-2 rounded-full"
                            >
                                <RotateCcw className="h-3 w-3" />
                                Thử lại
                            </Button>
                        </div>
                    ) : allItems.length > 0 ? (
                        <div className="max-h-80 overflow-y-auto divide-y divide-line/40">
                            {/* History section */}
                            {!debouncedQuery && searchHistory.length > 0 && (
                                <div>
                                    <div className="px-4 py-2 text-tiny font-semibold text-ink-faint uppercase tracking-wider sticky top-0 bg-surface flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-3 w-3" />
                                            Lịch sử tìm kiếm
                                        </span>
                                        <button
                                            onClick={handleClearHistory}
                                            className="text-destructive hover:underline text-tiny normal-case"
                                        >
                                            Xóa tất cả
                                        </button>
                                    </div>
                                    {searchHistory.map((item, idx) => (
                                        <button
                                            key={`history-${idx}`}
                                            onClick={() => handleSelectSuggestion(item)}
                                            className={`w-full px-4 py-2.5 text-left text-small transition-colors flex items-center justify-between ${
                                                selectedIndex === idx ? "bg-surface" : "hover:bg-surface/70"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 text-ink">
                                                <Clock className="h-3.5 w-3.5 text-ink-faint shrink-0" />
                                                <span className="truncate">{item}</span>
                                            </div>
                                            <ArrowRight className="h-3.5 w-3.5 text-ink-faint opacity-50" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Suggestions section */}
                            {displaySuggestions.length > 0 && (
                                <div>
                                    {!debouncedQuery && (
                                        <div className="px-4 py-2 text-tiny font-semibold text-ink-faint uppercase tracking-wider sticky top-0 bg-surface">
                                            Gợi ý sản phẩm
                                        </div>
                                    )}
                                    {displaySuggestions.map((suggestion, idx) => (
                                        <button
                                            key={`suggestion-${idx}`}
                                            onClick={() => handleSelectSuggestion(suggestion.text)}
                                            className={`w-full px-4 py-2.5 text-left text-small transition-colors flex items-center justify-between ${
                                                selectedIndex === idx + searchHistory.length ? "bg-surface" : "hover:bg-surface/70"
                                            }`}
                                        >
                                            <div className="min-w-0 pr-2">
                                                <div className="font-medium text-ink truncate">{suggestion.text}</div>
                                                {suggestion.categoryName && (
                                                    <div className="text-tiny text-ink-faint">{suggestion.categoryName}</div>
                                                )}
                                            </div>
                                            <ArrowRight className="h-3.5 w-3.5 text-ink-faint shrink-0 opacity-50" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-small text-ink-faint">
                            {debouncedQuery ? "Không tìm thấy kết quả phù hợp" : "Bắt đầu nhập để tìm kiếm..."}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
