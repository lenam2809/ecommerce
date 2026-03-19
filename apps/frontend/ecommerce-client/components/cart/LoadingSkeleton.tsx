// components/cart/LoadingSkeleton.tsx
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const LoadingSkeleton = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <div className="bg-card rounded-lg border overflow-hidden shadow-sm">
                    <div className="p-4 bg-muted/50 border-b">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <Skeleton className="h-6 w-24" />
                            </div>
                            <div className="col-span-2 text-center hidden md:block">
                                <Skeleton className="h-6 w-12 mx-auto" />
                            </div>
                            <div className="col-span-2 text-center">
                                <Skeleton className="h-6 w-16 mx-auto" />
                            </div>
                            <div className="col-span-2 text-right">
                                <Skeleton className="h-6 w-16 ml-auto" />
                            </div>
                        </div>
                    </div>

                    {Array(3)
                        .fill(0)
                        .map((_, index) => (
                            <div key={index} className="p-4 border-b">
                                <div className="grid grid-cols-12 gap-4 items-center">
                                    <div className="col-span-6">
                                        <div className="flex items-center">
                                            <Skeleton className="h-20 w-20 rounded-lg" />
                                            <div className="ml-4 flex-1">
                                                <Skeleton className="h-5 w-40 mb-2" />
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-center hidden md:block">
                                        <Skeleton className="h-5 w-20 mx-auto" />
                                    </div>
                                    <div className="col-span-3 md:col-span-2">
                                        <Skeleton className="h-10 w-full rounded" />
                                    </div>
                                    <div className="col-span-3 md:col-span-2 text-right">
                                        <Skeleton className="h-5 w-24 ml-auto" />
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            <div className="lg:col-span-1">
                <div className="bg-card rounded-lg border overflow-hidden shadow-sm">
                    <div className="p-4 bg-muted/50 border-b">
                        <Skeleton className="h-6 w-40" />
                    </div>

                    <div className="p-4 space-y-4">
                        <div className="flex items-center">
                            <Skeleton className="h-4 w-4 mr-2 rounded" />
                            <Skeleton className="h-4 w-32" />
                        </div>

                        <div className="flex justify-between">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-5 w-24" />
                        </div>

                        <div className="flex justify-between">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-20" />
                        </div>

                        <Separator />

                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-32" />
                        </div>

                        <div className="bg-muted/50 p-4 rounded-lg">
                            <Skeleton className="h-4 w-24 mb-3" />
                            <div className="flex space-x-2">
                                <Skeleton className="h-10 w-full flex-1" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </div>

                        <Skeleton className="h-12 w-full" />

                        <div className="flex items-center justify-center space-x-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingSkeleton;