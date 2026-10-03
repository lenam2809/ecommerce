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
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background text-foreground selection:bg-brand selection:text-white">
            {/* Subtle surface background */}
            <div className="absolute inset-0 bg-surface opacity-40" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            {/* Top Navigation */}
            <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-50">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-small font-medium text-ink-soft hover:text-brand transition-colors px-4 py-2 rounded-full border border-line bg-card/80 backdrop-blur-md shadow-2xs"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Trang chủ</span>
                </Link>

                <div className="rounded-full p-1 border border-line bg-card/80 backdrop-blur-md shadow-2xs">
                    <ThemeToggle />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 w-full max-w-[460px] px-4 py-20 animate-fade-in">
                {children}
            </div>

            {/* Footer Text */}
            <div className="absolute bottom-4 sm:bottom-6 text-center text-tiny text-ink-faint z-10">
                &copy; {new Date().getFullYear()} ShopViet Inc. Công nghệ &amp; Đời sống tối giản.
            </div>
        </div>
    );
}
