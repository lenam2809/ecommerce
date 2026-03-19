// app/(auth)/layout.tsx
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background text-foreground selection:bg-primary selection:text-white">
            {/* Dynamic Mesh Background */}
            <div className="absolute inset-0 mesh-gradient-bg opacity-30 dark:opacity-40" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            {/* Top Navigation */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors glass px-4 py-2 rounded-full"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Trang chủ
                </Link>

                <div className="glass rounded-full p-1">
                    <ThemeToggle />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 w-full max-w-[420px] px-4 animate-fade-in">
                {children}
            </div>

            {/* Footer Text */}
            <div className="absolute bottom-6 text-center text-xs text-muted-foreground z-10">
                &copy; {new Date().getFullYear()} ShopViet Inc. Premium Commerce.
            </div>
        </div>
    );
}