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
            {[5, 4, 3].map((itemRating) => {
                const isChecked = rating === itemRating

                return (
                    <div
                        key={itemRating}
                        className={`flex items-center space-x-2.5 p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isChecked ? "bg-surface-2" : "hover:bg-surface-2/60"
                        }`}
                        onClick={() => onRatingChange(itemRating)}
                    >
                        <Checkbox
                            id={`rating-${itemRating}`}
                            checked={isChecked}
                            onCheckedChange={() => onRatingChange(itemRating)}
                            className="data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                        />
                        <label
                            htmlFor={`rating-${itemRating}`}
                            className="text-small cursor-pointer flex items-center text-ink flex-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-0.5">
                                {[...Array(itemRating)].map((_, i) => (
                                    <Star
                                        key={`full-${i}`}
                                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                                    />
                                ))}
                                {[...Array(5 - itemRating)].map((_, i) => (
                                    <Star
                                        key={`empty-${i}`}
                                        className="h-3.5 w-3.5 fill-line text-line"
                                    />
                                ))}
                            </div>
                            <span className="ml-2 text-tiny font-medium text-ink-soft">
                                {itemRating === 5 ? "5.0 sao" : `Từ ${itemRating}.0 sao`}
                            </span>
                        </label>
                    </div>
                )
            })}
        </div>
    )
}