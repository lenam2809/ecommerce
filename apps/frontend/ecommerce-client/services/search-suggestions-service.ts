// search-suggestions-service.ts
import { SaveSearchHistoryRequest, SearchSuggestion } from '@/types/search-suggestion';
import { BaseService } from './base-service';
import { Result } from '@/types';

class SearchSuggestionsService extends BaseService {
    constructor() {
        super('/searchsuggestions');
    }

    async getSearchSuggestions(query?: string, limit: number = 5): Promise<Result<SearchSuggestion[]>> {
        return await this.get<SearchSuggestion[]>('/searchsuggestions/search-suggestions', { query, limit });
    }

    async getTrendingSuggestions(limit: number = 10): Promise<Result<SearchSuggestion[]>> {
        return await this.get<SearchSuggestion[]>('/searchsuggestions/search-trending', { limit });
    }

    async saveSearchHistory(request: SaveSearchHistoryRequest): Promise<Result<string>> {
        return await this.post<string>('/searchsuggestions/search-history', request);
    }

    async deleteSearchHistory(id: string): Promise<Result<boolean>> {
        return await this.delete<boolean>(`/searchsuggestions/header-history/${id}`);
    }

    async clearSearchHistory(userId: string): Promise<Result<boolean>> {
        return await this.deleteUrl<boolean>('/searchsuggestions/header-history', userId);
    }

}

const searchSuggestionsService = new SearchSuggestionsService();
export default searchSuggestionsService;