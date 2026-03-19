import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { GenericList } from "@/components/generic/generic-list"
import { productListConfig } from "@/config/product-list-config"

export const metadata: Metadata = {
  title: "Products | E-Commerce Dashboard",
  description: "Manage your products",
}

export default function ProductsPage() {
  return (
    <DashboardShell>
      <GenericList config={productListConfig} />
    </DashboardShell>
  )
}
