import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
        </div>
    )
}
