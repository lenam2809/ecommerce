import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { GenericList } from "@/components/generic/generic-list"
import { promoCodeListConfig } from "@/config/promo-code-list-config"

export const metadata: Metadata = {
    title: "PromoCodes | E-Commerce Dashboard",
    description: "Manage your promo-codes",
}

export default function PromoCodesPage() {
    return (
        <DashboardShell>
            <GenericList config={promoCodeListConfig} />
        </DashboardShell>
    )
}