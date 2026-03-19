// components/product-filters/rating-filter.tsx
"use client"

import { Star } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface RatingFilterProps {
    rating: number | null
    onRatingChange: (rating: number) => void
}

export function RatingFilter({ rating, onRatingChange }: RatingFilterProps) {
    return (
        <div className="space-y-2">
            {[5, 4, 3].map((itemRating) => (
                <div key={itemRating} className="flex items-center space-x-2">
                    <Checkbox
                        id={`rating-${itemRating}`}
                        checked={rating === itemRating}
                        onCheckedChange={() => onRatingChange(itemRating)}
                    />
                    <label
                        htmlFor={`rating-${itemRating}`}
                        className="text-sm cursor-pointer flex items-center dark:text-gray-300"
                    >
                        <div className="flex">
                            {[...Array(itemRating)].map((_, i) => (
                                <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            {[...Array(5 - itemRating)].map((_, i) => (
                                <Star
                                    key={`empty-${i}`}
                                    className="h-4 w-4 fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600"
                                />
                            ))}
                        </div>
                        <span className="ml-1">{itemRating === 5 ? '' : `trở lên`}</span>
                    </label>
                </div>
            ))}
        </div>
    )
}