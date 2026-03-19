import type React from "react";
import { useKpiData } from "@/hooks/use-dashboard";
import { SectionCards } from "./section-cards";

export function KpiCards() {
    const { data, isLoading, error } = useKpiData();

    if (error) {
        return <div className="text-red-500">Error loading KPIs: {error.message}</div>;
    }

    return <SectionCards cards={isLoading ? [] : data?.data || []} isLoading={isLoading} />;
}