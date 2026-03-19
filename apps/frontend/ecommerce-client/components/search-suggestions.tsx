"use client"
import { forwardRef } from "react"
import { Search } from "lucide-react"
import { SearchSuggestion } from "@/types/search-suggestion"

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[]
  onSelect: (suggestion: SearchSuggestion) => void
}

const SearchSuggestions = forwardRef<HTMLDivElement, SearchSuggestionsProps>(
  ({ suggestions, onSelect }, ref) => {
    if (suggestions.length === 0) return null

    const handleClick = (suggestion: SearchSuggestion) => {
      // Gọi callback từ component cha nếu có
      onSelect?.(suggestion)
    }

    return (
      <div
        ref={ref}
        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto"
        onMouseDown={(e) => e.preventDefault()} // Ngăn chặn onBlur của input
      >
        <ul className="py-2">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <button
                className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleClick(suggestion)}
              >
                <Search className="h-4 w-4 mr-2 text-gray-400" />
                <span className="flex-1">
                  <span className="block dark:text-gray-200">{suggestion.text}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {suggestion.categoryName}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }
)

SearchSuggestions.displayName = "SearchSuggestions"

export default SearchSuggestions