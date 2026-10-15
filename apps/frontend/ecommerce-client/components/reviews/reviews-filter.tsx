import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReviewsFilterProps {
    reviewCount: number
    onSortChange: (value: string) => void
}

export function ReviewsFilter({ reviewCount, onSortChange }: ReviewsFilterProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-line">
            <h3 className="text-h3 font-semibold text-ink mb-4 sm:mb-0 flex items-center">
                Tất cả đánh giá
                <span className="ml-3 bg-surface-2 px-3 py-1 rounded-full text-small font-normal text-ink-soft">{reviewCount}</span>
            </h3>
            <div className="flex items-center space-x-3">
                <span className="text-small font-medium text-ink-faint uppercase tracking-wider">Sắp xếp:</span>
                <Select defaultValue="newest" onValueChange={onSortChange}>
                    <SelectTrigger className="w-[180px] bg-card border-line rounded-full">
                        <SelectValue placeholder="Sắp xếp theo" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-line rounded-xl">
                        <SelectItem value="newest" className="focus:bg-brand-soft focus:text-brand">Mới nhất</SelectItem>
                        <SelectItem value="highest" className="focus:bg-brand-soft focus:text-brand">Đánh giá cao nhất</SelectItem>
                        <SelectItem value="lowest" className="focus:bg-brand-soft focus:text-brand">Đánh giá thấp nhất</SelectItem>
                        <SelectItem value="helpful" className="focus:bg-brand-soft focus:text-brand">Hữu ích nhất</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}