import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReviewsFilterProps {
    reviewCount: number
    onSortChange: (value: string) => void
}

export function ReviewsFilter({ reviewCount, onSortChange }: ReviewsFilterProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-white/10">
            <h3 className="tech-heading text-xl font-bold mb-4 sm:mb-0 flex items-center">
                Tất cả đánh giá
                <span className="ml-3 bg-secondary px-3 py-1 rounded-full text-sm font-normal text-muted-foreground">{reviewCount}</span>
            </h3>
            <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sắp xếp:</span>
                <Select defaultValue="newest" onValueChange={onSortChange}>
                    <SelectTrigger className="w-[180px] bg-secondary/30 border-white/10 rounded-lg">
                        <SelectValue placeholder="Sắp xếp theo" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/10">
                        <SelectItem value="newest" className="focus:bg-primary/20 focus:text-primary">Mới nhất</SelectItem>
                        <SelectItem value="highest" className="focus:bg-primary/20 focus:text-primary">Đánh giá cao nhất</SelectItem>
                        <SelectItem value="lowest" className="focus:bg-primary/20 focus:text-primary">Đánh giá thấp nhất</SelectItem>
                        <SelectItem value="helpful" className="focus:bg-primary/20 focus:text-primary">Hữu ích nhất</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}