import { Skeleton } from "@/components/ui/skeleton"

export default function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array(6)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
          >
            <Skeleton className="h-24 w-24 rounded-full mb-3 dark:bg-gray-700" />
            <Skeleton className="h-5 w-20 dark:bg-gray-700" />
          </div>
        ))}
    </div>
  )
}



