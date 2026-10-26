// app/(auth)/layout.tsx
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import {
    ArrowLeft,
    Crown,
    ShieldCheck,
    Zap,
    RotateCcw,
    Sparkles,
    CheckCircle2,
} from "lucide-react"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="relative min-h-screen w-full flex flex-col justify-between bg-background text-slate-900 dark:text-slate-100 selection:bg-primary selection:text-white">
            {/* Top Bar */}
            <header className="w-full px-4 sm:px-8 py-4 flex justify-between items-center z-30 max-w-7xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-card shadow-2xs"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại ShopViet</span>
                </Link>

                <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span>Hệ thống xác thực bảo mật 2026</span>
                    </span>
                    <div className="rounded-xl p-0.5 border border-slate-200 dark:border-slate-800 bg-card shadow-2xs">
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Main Split-Screen Container */}
            <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-10 z-20">
                <div className="w-full max-w-5xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-card shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                    {/* Left Column: ShopViet Privilege Black Diamond 3D Card & 4 Perks */}
                    <div className="lg:col-span-6 bg-slate-950 text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
                        {/* Subtle ambient glow */}
                        <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-600/20 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-indigo-600/15 blur-3xl" />

                        <div className="relative z-10 space-y-6">
                            {/* Brand Header */}
                            <div className="flex items-center justify-between">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-extrabold uppercase tracking-wider">
                                    <Crown className="h-3.5 w-3.5 text-amber-400" />
                                    <span>ShopViet Privilege Club</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400 tabular-nums">
                                    45 Showroom Toàn Quốc
                                </span>
                            </div>

                            <div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                                    Đặc quyền công nghệ xứng tầm thành viên VIP
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                                    Đồng bộ bảo hành điện tử, tích lũy điểm thưởng và nhận ưu đãi độc quyền trên toàn hệ thống 45 Showroom ShopViet.
                                </p>
                            </div>

                            {/* 3D Black Diamond VIP Card — Clean 2-Column Metadata Layout (No overlap on HẾT HẠN 12/28) */}
                            <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border border-slate-700/80 shadow-2xl relative overflow-hidden">
                                <div className="flex items-center justify-between gap-2 mb-5">
                                    <div>
                                        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-400 block">
                                            SHOPVIET PRIVILEGE
                                        </span>
                                        <span className="text-base font-extrabold text-white tracking-tight">
                                            BLACK DIAMOND VIP
                                        </span>
                                    </div>
                                    <div className="h-9 w-9 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300">
                                        <Crown className="h-5 w-5" />
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                                        Chủ thẻ thành viên
                                    </p>
                                    <p className="text-lg font-extrabold tracking-wide text-white mt-0.5">
                                        NGUYỄN MINH QUÂN
                                    </p>
                                </div>

                                {/* Clean 2-Column Metadata Grid inside 3D VIP Card */}
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/70 text-xs">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                            Điểm tích lũy
                                        </span>
                                        <span className="text-sm font-extrabold text-emerald-400 tabular-nums whitespace-nowrap mt-0.5 block">
                                            2.450 ĐIỂM VIP
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                            Hiệu lực thẻ
                                        </span>
                                        <span className="text-sm font-extrabold text-slate-200 tabular-nums whitespace-nowrap mt-0.5 block">
                                            HẾT HẠN 12/28
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 4 Member Perks List (No fake customer testimonial quote) */}
                            <div className="space-y-3 pt-1">
                                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                                    4 Đặc quyền thành viên chính thức:
                                </p>
                                <div className="grid grid-cols-1 gap-2.5 text-xs">
                                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                                        <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold text-white">Tích điểm &amp; Giảm thêm tới 5%:</span>{" "}
                                            <span className="text-slate-300">Tặng ngay voucher TECHVIP500 (-500.000₫) cho đơn hàng Flagship.</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                                        <Zap className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold text-white">Giao siêu tốc 2H miễn phí:</span>{" "}
                                            <span className="text-slate-300">Ưu tiên điều phối GHN Express cho mọi đơn từ 500.000₫.</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                                        <RotateCcw className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold text-white">Bảo hành điện tử &amp; 1 đổi 1 (30 ngày):</span>{" "}
                                            <span className="text-slate-300">Tra cứu Serial/IMEI trực tuyến tại 45 Showroom toàn quốc.</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold text-white">Đặc quyền Pre-Order không cần cọc:</span>{" "}
                                            <span className="text-slate-300">Giữ suất sớm nhất cho iPhone 16 Pro Max &amp; MacBook M3 Pro.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hotline Footer inside Dark Panel */}
                        <div className="relative z-10 pt-6 mt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                            <span>Tổng đài CSKH: <strong className="text-white font-mono tabular-nums whitespace-nowrap">1800 6868</strong></span>
                            <span>Hỗ trợ KT: <strong className="text-white font-mono tabular-nums whitespace-nowrap">1800 6869</strong></span>
                        </div>
                    </div>

                    {/* Right Column: Auth Form Area */}
                    <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center bg-card">
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-4 text-center text-xs text-slate-600 dark:text-slate-400">
                &copy; 2026 Công ty Cổ phần Công nghệ ShopViet. Hệ thống 45 Showroom chính hãng toàn quốc.
            </footer>
        </div>
    )
}
