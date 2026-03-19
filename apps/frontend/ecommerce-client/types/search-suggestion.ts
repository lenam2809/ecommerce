
export interface SearchSuggestion {
    id: string;
    text: string;
    searchCount: number;
    lastSearched: string;
    isTrending: boolean;
    categoryName?: string;
    categoryIcon?: string;
}

export interface SaveSearchHistoryRequest {
    searchText: string;
    userId?: string;
    categoryName?: string;
}