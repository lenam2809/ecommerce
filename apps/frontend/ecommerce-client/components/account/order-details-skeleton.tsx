import Link from "next/link";
import { Button } from "../ui/button";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export function OrderDetailsSkeleton() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Button variant="ghost" asChild disabled className="rounded-full">
                    <Link href="/orders" className="flex items-center">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Quay lại danh sách đơn hàng
                    </Link>
                </Button>
            </div>

            <div className="bg-card rounded-2xl border border-line overflow-hidden">
                <div className="p-6 border-b border-line">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <div className="flex items-center mt-2">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="ml-2 h-4 w-40" />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-32 rounded-full" />
                            <Skeleton className="h-10 w-24 rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-32" />
                            <div className="border border-line rounded-2xl divide-y divide-line">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="p-4">
                                        <div className="flex gap-4">
                                            <Skeleton className="w-16 h-16 rounded-xl" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-5 w-3/4" />
                                                <Skeleton className="h-4 w-1/2" />
                                                <Skeleton className="h-4 w-1/3" />
                                            </div>
                                            <Skeleton className="h-5 w-20" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Skeleton className="h-6 w-40" />
                            <div className="border border-line rounded-2xl p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-36" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-36" />
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="border border-line rounded-2xl p-4">
                            <Skeleton className="h-6 w-40 mb-4" />
                            <div className="space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border border-line rounded-2xl p-4">
                            <Skeleton className="h-6 w-40 mb-4" />
                            <div className="space-y-2">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-48" />
                                    <Skeleton className="h-4 w-56" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-36" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
