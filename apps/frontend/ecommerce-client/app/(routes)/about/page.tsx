"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
    ChevronRight,
    Home,
    Store,
    ShieldCheck,
    Zap,
    RotateCcw,
    PhoneCall,
    MapPin,
    Clock,
    Building2,
    FileUp,
    CheckCircle2,
    Award,
    Navigation,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAbout } from "@/hooks/use-about"
import { toast } from "sonner"

interface ShowroomBranch {
    id: string
    city: "TP. Hồ Chí Minh" | "Hà Nội" | "Đà Nẵng" | "Cần Thơ"
    name: string
    address: string
    phone: string
    isFlagship?: boolean
    services: string[]
}

const SHOWROOM_NETWORK_2026: ShowroomBranch[] = [
    {
        id: "sr-1",
        city: "TP. Hồ Chí Minh",
        name: "ShopViet Flagship सेंटर — Quận 1",
        address: "125 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
        phone: "1800 6868 (Nhánh 101)",
        isFlagship: true,
        services: ["Apple Authorized Reseller", "Trung tâm Bảo hành 15p", "B2B Lounge"],
    },
    {
        id: "sr-2",
        city: "TP. Hồ Chí Minh",
        name: "ShopViet Experience Store — Crescent Mall Q.7",
        address: "Tầng G, 101 Tôn Dật Tiên, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh",
        phone: "1800 6868 (Nhánh 102)",
        isFlagship: true,
        services: ["Khu trải nghiệm Mac Studio", "Bảo hành 1 đổi 1", "Trả góp 0%"],
    },
    {
        id: "sr-3",
        city: "TP. Hồ Chí Minh",
        name: "ShopViet Landmark 81 — Quận Bình Thạnh",
        address: "L2-15 Vinhomes Central Park, 208 Nguyễn Hữu Cảnh, Q. Bình Thạnh, TP.HCM",
        phone: "1800 6868 (Nhánh 105)",
        services: ["Giao hỏa tốc 2H", "Thu cũ đổi mới trợ giá 3Tr"],
    },
    {
        id: "sr-4",
        city: "Hà Nội",
        name: "ShopViet Flagship Cầu Giấy — Hà Nội",
        address: "245 Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội",
        phone: "1800 6868 (Nhánh 201)",
        isFlagship: true,
        services: ["Apple Authorized Service", "Bảo hành lấy ngay 15p", "Phòng Lab Hi-End"],
    },
    {
        id: "sr-5",
        city: "Hà Nội",
        name: "ShopViet Thái Hà — Đống Đa",
        address: "168 Thái Hà, Phường Trung Liệt, Quận Đống Đa, Hà Nội",
        phone: "1800 6868 (Nhánh 202)",
        services: ["Trung tâm Laptop & Gaming", "Giao siêu tốc 2H"],
    },
    {
        id: "sr-6",
        city: "Đà Nẵng",
        name: "ShopViet Flagship Nguyễn Văn Linh — Đà Nẵng",
        address: "88 Nguyễn Văn Linh, Quận Hải Châu, TP. Đà Nẵng",
        phone: "1800 6868 (Nhánh 301)",
        isFlagship: true,
        services: ["Trung tâm Bảo hành Miền Trung", "Apple & Samsung Flagship"],
    },
    {
        id: "sr-7",
        city: "Cần Thơ",
        name: "ShopViet Ninh Kiều — Cần Thơ",
        address: "52 Đại lộ Hòa Bình, Quận Ninh Kiều, TP. Cần Thơ",
        phone: "1800 6868 (Nhánh 401)",
        services: ["Showroom Ủy quyền", "Đổi mới 30 ngày"],
    },
]

export default function AboutPage() {
    // Keep useAbout hook intact for contract preservation
    const { data: aboutInfo } = useAbout()

    const [selectedCity, setSelectedCity] = useState<string>("Tất cả (45)")
    const [b2bCompany, setB2bCompany] = useState("")
    const [b2bTaxId, setB2bTaxId] = useState("")
    const [b2bContact, setB2bContact] = useState("")
    const [b2bPhone, setB2bPhone] = useState("")
    const [b2bEmail, setB2bEmail] = useState("")
    const [b2bNote, setB2bNote] = useState("")
    const [b2bFileName, setB2bFileName] = useState<string>("")

    const filteredShowrooms =
        selectedCity === "Tất cả (45)"
            ? SHOWROOM_NETWORK_2026
            : SHOWROOM_NETWORK_2026.filter((s) => s.city === selectedCity)

    const handleB2bSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        toast.success(
            "Đã gửi hồ sơ đề xuất B2B / Dự án doanh nghiệp! Chuyên viên Khối Khách hàng Doanh nghiệp sẽ liên hệ trong 30 phút."
        )
        setB2bCompany("")
        setB2bTaxId("")
        setB2bContact("")
        setB2bPhone("")
        setB2bEmail("")
        setB2bNote("")
        setB2bFileName("")
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] py-8 md:py-12">
            <div className="container-app space-y-12 md:space-y-16">
                {/* Breadcrumb */}
                <nav
                    aria-label="Breadcrumb"
                    className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                    <Link
                        href="/"
                        className="hover:text-primary transition-colors inline-flex items-center gap-1 font-medium"
                    >
                        <Home className="h-3.5 w-3.5" />
                        <span>Trang chủ</span>
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-bold text-slate-900 dark:text-white">
                        Về ShopViet &amp; Hệ thống 45 Showroom Công nghệ
                    </span>
                </nav>

                {/* Dark Obsidian Bento Hero (D3-06 SSoT 2026) */}
                <section className="rounded-3xl bg-[#090D16] text-white border border-slate-800 p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-xl">
                    <div className="pointer-events-none absolute -top-28 -right-28 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        <div className="lg:col-span-7 space-y-5">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-extrabold uppercase tracking-wider">
                                <Award className="h-3.5 w-3.5" />
                                <span>Đại lý Ủy quyền Cấp 1 Chính hãng • Năm 2026</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                                {aboutInfo?.hero?.title ||
                                    "Hệ sinh thái Bán lẻ Công nghệ Cao cấp — 45 Showroom Toàn Quốc"}
                            </h1>
                            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                                {aboutInfo?.hero?.description ||
                                    "ShopViet tiên phong mô hình Hybrid O2O kết hợp trải nghiệm thực tế tại 45 Showroom tiêu chuẩn Flagship và dịch vụ giao hàng siêu tốc 2H, bảo hành điện tử chính hãng theo từng mã Serial/IMEI."}
                            </p>

                            {/* SSoT 2026 Key Metrics */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800">
                                    <span className="text-2xl font-extrabold text-blue-400 tabular-nums block">
                                        45
                                    </span>
                                    <span className="text-xs text-slate-300 font-semibold mt-0.5 block">
                                        Showroom Toàn Quốc
                                    </span>
                                </div>
                                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800">
                                    <span className="text-2xl font-extrabold text-emerald-400 tabular-nums block">
                                        2 Giờ
                                    </span>
                                    <span className="text-xs text-slate-300 font-semibold mt-0.5 block">
                                        Giao Siêu Tốc Nội Thành
                                    </span>
                                </div>
                                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800">
                                    <span className="text-2xl font-extrabold text-amber-400 tabular-nums block">
                                        1800 6868
                                    </span>
                                    <span className="text-xs text-slate-300 font-semibold mt-0.5 block">
                                        Hotline CSKH Miễn Phí
                                    </span>
                                </div>
                                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800">
                                    <span className="text-2xl font-extrabold text-white tabular-nums block">
                                        1800 6869
                                    </span>
                                    <span className="text-xs text-slate-300 font-semibold mt-0.5 block">
                                        Tổng Đài Kỹ Thuật 24/7
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5">
                            <div className="relative h-[280px] sm:h-[340px] rounded-2xl overflow-hidden border border-slate-700/80 bg-[#111827]">
                                <Image
                                    src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1000&auto=format&fit=crop&q=80"
                                    alt="Không gian trải nghiệm công nghệ tại 45 Showroom ShopViet"
                                    fill
                                    className="object-cover opacity-90"
                                    priority
                                />
                                <div className="absolute bottom-3 inset-x-3 p-3.5 rounded-xl bg-[#090D16]/90 backdrop-blur-md border border-slate-700/80 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                                        <span className="font-bold text-white">
                                            Đang mở cửa • Đóng cửa lúc 21:30
                                        </span>
                                    </div>
                                    <span className="text-blue-400 font-extrabold tabular-nums">
                                        45 Chi nhánh
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4 Core Trust Pillars */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            icon: ShieldCheck,
                            title: "100% Chính hãng VN/A",
                            desc: "Đối tác ủy quyền trực tiếp của Apple, Samsung, Sony, LG, ASUS với đầy đủ hóa đơn VAT.",
                        },
                        {
                            icon: RotateCcw,
                            title: "1 Đổi 1 trong 30 ngày",
                            desc: "Đổi máy mới nguyên seal ngay trong 15 phút tại bất kỳ Showroom nào trong 45 chi nhánh.",
                        },
                        {
                            icon: Zap,
                            title: "Giao Siêu Tốc 2H Miễn Phí",
                            desc: "Miễn phí vận chuyển toàn quốc cho mọi đơn từ 500.000₫, bảo hiểm hàng hóa 100%.",
                        },
                        {
                            icon: PhoneCall,
                            title: "Hỗ trợ Kỹ thuật Chuyên sâu",
                            desc: "Tổng đài CSKH 1800 6868 và Kỹ thuật 1800 6869 hoạt động xuyên suốt 08:00 - 22:00.",
                        },
                    ].map((pillar, i) => {
                        const Icon = pillar.icon
                        return (
                            <div
                                key={i}
                                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-xs space-y-2.5"
                            >
                                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                                    {pillar.title}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {pillar.desc}
                                </p>
                            </div>
                        )
                    })}
                </section>

                {/* Interactive 45 Showroom Locator & Map Filter */}
                <section id="showrooms" className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 md:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                        <div>
                            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-primary mb-1">
                                <Store className="h-4 w-4" />
                                <span>Mạng lưới O2O Toàn Quốc</span>
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Tra cứu 45 Showroom &amp; Trung tâm Bảo hành Ủy quyền
                            </h2>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                Lọc theo Tỉnh/Thành phố để kiểm tra tồn kho và đặt lịch trải nghiệm sản phẩm
                            </p>
                        </div>

                        {/* Province/City Filter Pills */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                "Tất cả (45)",
                                "TP. Hồ Chí Minh",
                                "Hà Nội",
                                "Đà Nẵng",
                                "Cần Thơ",
                            ].map((city) => (
                                <button
                                    key={city}
                                    type="button"
                                    onClick={() => setSelectedCity(city)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        selectedCity === city
                                            ? "bg-primary text-white shadow-xs"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                                    }`}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Showroom Cards List */}
                        <div className="lg:col-span-7 space-y-3 max-h-[520px] overflow-y-auto pr-1">
                            {filteredShowrooms.map((branch) => (
                                <div
                                    key={branch.id}
                                    className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-primary transition-all bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                                {branch.name}
                                            </h3>
                                            {branch.isFlagship && (
                                                <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-extrabold">
                                                    Flagship
                                                </span>
                                            )}
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                                            <Clock className="h-3 w-3" />
                                            Đang mở cửa • Đóng cửa lúc 21:30
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                        <span>{branch.address}</span>
                                    </p>

                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                        <div className="flex flex-wrap gap-1.5">
                                            {branch.services.map((srv) => (
                                                <span
                                                    key={srv}
                                                    className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                                                >
                                                    {srv}
                                                </span>
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-primary tabular-nums flex items-center gap-1">
                                            <Navigation className="h-3 w-3" />
                                            {branch.phone}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Interactive Map Preview */}
                        <div className="lg:col-span-5 min-h-[380px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-900">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.513274621584!2d106.6972363!3d10.7719444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3f3129e64d%3A0x8d6b2d79522c7f30!2zMTI1IEzDqiBM4bujaSwgQuG6v24gVGjDoG5oLCBRdeG6rW4gMSwgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1743667684381!5m2!1svi!2s"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Bản đồ hệ thống 45 Showroom ShopViet"
                                className="absolute inset-0"
                            />
                        </div>
                    </div>
                </section>

                {/* B2B Corporate & Project Partnership Form with File Attachment (D3-06 SSoT) */}
                <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 md:p-10 shadow-xs">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-5 space-y-4">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-wider">
                                <Building2 className="h-3.5 w-3.5" />
                                <span>Khối Khách hàng Doanh nghiệp (B2B)</span>
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Liên hệ Hợp tác B2B &amp; Báo giá Dự án Thiết bị Công nghệ
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Cung cấp giải pháp trang thiết bị Apple MacBook, iPad, Workstation chính hãng số lượng lớn cho doanh nghiệp, trường học với chiết khấu dự án đặc biệt và xuất hóa đơn GTGT (VAT) chuẩn mực.
                            </p>

                            <div className="space-y-2.5 pt-2 text-xs text-slate-700 dark:text-slate-300">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                    <span>Chiết khấu dự án doanh nghiệp từ 5% - 18%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                    <span>Hỗ trợ tích hợp Apple Business Manager (ABM) miễn phí</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                    <span>Công nợ linh hoạt &amp; Bảo hành tận nơi tại doanh nghiệp</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                                <p className="font-bold text-slate-900 dark:text-white">
                                    Đường dây nóng Khối Doanh nghiệp B2B:
                                </p>
                                <p className="text-primary font-extrabold text-sm tabular-nums">
                                    1800 6868 (Nhánh 9) • b2b@shopviet.vn
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleB2bSubmit} className="lg:col-span-7 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Tên Doanh nghiệp / Tổ chức *
                                    </label>
                                    <Input
                                        required
                                        value={b2bCompany}
                                        onChange={(e) => setB2bCompany(e.target.value)}
                                        placeholder="Công ty Cổ phần Công nghệ..."
                                        className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Mã số thuế doanh nghiệp *
                                    </label>
                                    <Input
                                        required
                                        inputMode="numeric"
                                        value={b2bTaxId}
                                        onChange={(e) => setB2bTaxId(e.target.value)}
                                        placeholder="0316889922"
                                        className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm tabular-nums"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Người đại diện liên hệ *
                                    </label>
                                    <Input
                                        required
                                        value={b2bContact}
                                        onChange={(e) => setB2bContact(e.target.value)}
                                        placeholder="Họ và tên người phụ trách"
                                        className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Số điện thoại liên hệ *
                                    </label>
                                    <Input
                                        required
                                        type="tel"
                                        inputMode="tel"
                                        value={b2bPhone}
                                        onChange={(e) => setB2bPhone(e.target.value)}
                                        placeholder="0909 686 868"
                                        className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm tabular-nums"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Email doanh nghiệp nhận báo giá *
                                    </label>
                                    <Input
                                        required
                                        type="email"
                                        value={b2bEmail}
                                        onChange={(e) => setB2bEmail(e.target.value)}
                                        placeholder="procurement@company.vn"
                                        className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Đính kèm Hồ sơ năng lực / Danh mục yêu cầu báo giá (PDF, XLSX, DOCX)
                                    </label>
                                    <label className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-dashed border-primary/40 bg-blue-50/40 dark:bg-blue-950/20 cursor-pointer hover:border-primary transition-colors">
                                        <div className="flex items-center gap-2.5 text-xs">
                                            <FileUp className="h-4 w-4 text-primary shrink-0" />
                                            <span className="font-bold text-slate-800 dark:text-slate-200">
                                                {b2bFileName || "Chọn tệp hồ sơ năng lực hoặc danh sách cấu hình cần báo giá..."}
                                            </span>
                                        </div>
                                        <span className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-bold shrink-0">
                                            Đính kèm tệp
                                        </span>
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) setB2bFileName(file.name)
                                            }}
                                        />
                                    </label>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Nội dung yêu cầu chi tiết
                                    </label>
                                    <Textarea
                                        value={b2bNote}
                                        onChange={(e) => setB2bNote(e.target.value)}
                                        placeholder="Ví dụ: Cần báo giá 25 máy MacBook Pro 14 M3 Pro 18GB/512GB kèm gói AppleCare+ cho văn phòng Quận 1..."
                                        className="rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm min-h-[90px]"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full sm:w-auto h-11 px-8 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold cursor-pointer"
                            >
                                Gửi yêu cầu Báo giá B2B &amp; Hồ sơ
                            </Button>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    )
}
