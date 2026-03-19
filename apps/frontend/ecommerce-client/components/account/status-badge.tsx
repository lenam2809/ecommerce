"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Truck, Package, XCircle } from "lucide-react"

export function StatusBadge({ status }: { status: string | number }) {
    const normalizedStatus = String(status || "").toLowerCase()

    switch (normalizedStatus) {
        case "delivered":
        case "3":
            return (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-none font-medium whitespace-nowrap">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    Đã giao
                </Badge>
            )
        case "processing":
        case "1":
            return (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-none font-medium whitespace-nowrap">
                    <Package className="h-3.5 w-3.5 mr-1.5" />
                    Đang xử lý
                </Badge>
            )
        case "shipping":
        case "shipped":
        case "2":
            return (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-none font-medium whitespace-nowrap">
                    <Truck className="h-3.5 w-3.5 mr-1.5" />
                    Đang giao
                </Badge>
            )
        case "pending":
        case "0":
            return (
                <Badge variant="outline" className="bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20 shadow-none font-medium whitespace-nowrap">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    Chờ xử lý
                </Badge>
            )
        case "cancelled":
        case "4":
            return (
                <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 shadow-none font-medium whitespace-nowrap">
                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    Đã hủy
                </Badge>
            )
        default:
            return (
                <Badge variant="outline" className="bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20 shadow-none font-medium whitespace-nowrap">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    Chờ xử lý
                </Badge>
            )
    }
}