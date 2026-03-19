import HelpPageContent from "@/components/helps/help-page-content"
import type { Metadata } from "next"
export const metadata: Metadata = {
    title: "Trợ giúp | E-commerce Dashboard",
    description: "Trung tâm trợ giúp cho người dùng E-commerce Dashboard",
}

export default function HelpPage() {
    return <HelpPageContent />
}
