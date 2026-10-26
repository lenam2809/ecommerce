"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import {
    ChevronRight,
    Home,
    Clock,
    FileUp,
    Store,
    Headphones,
    Wrench,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AppToaster } from "@/components/toast/app-toaster"
import { useContact } from "@/hooks/use-contact"

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    })
    const [attachedFile, setAttachedFile] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Keep useContact hook intact
    const { data: contactInfo } = useContact()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        await new Promise((resolve) => setTimeout(resolve, 600))

        AppToaster.success("Đã Gửi Yêu Cầu Liên Hệ", {
            description: "Chuyên viên CSKH ShopViet sẽ phản hồi bạn trong vòng 15 phút.",
        })

        setFormData({
            name: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
        })
        setAttachedFile("")
        setIsSubmitting(false)
    }

    return (
        <div className="min-h-screen bg-background py-8 md:py-12">
            <div className="container-app space-y-10">
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
                        Liên hệ Tổng đài &amp; 45 Showroom
                    </span>
                </nav>

                {/* Header */}
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
                        Trung tâm Chăm sóc Khách hàng &amp; B2B 2026
                    </p>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Liên hệ Hệ thống 45 Showroom ShopViet
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Hỗ trợ tư vấn mua hàng, tra cứu Bảo hành Điện tử và hợp tác dự án doanh nghiệp B2B toàn quốc.
                    </p>
                </div>

                {/* SSoT 2026 Contact Cards (1800 6868 CSKH, 1800 6869 Kỹ thuật, 45 Showrooms) */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-2">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Headphones className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                            Tổng đài Tư vấn &amp; CSKH (Miễn phí)
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Hoạt động 08:00 - 22:00 (Cả Thứ 7 &amp; Chủ Nhật)
                        </p>
                        <a
                            href="tel:18006868"
                            className="text-2xl font-extrabold text-primary hover:underline block font-mono tabular-nums pt-1"
                        >
                            1800 6868
                        </a>
                    </div>

                    <div className="bg-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-2">
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <Wrench className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                            Hỗ trợ Kỹ thuật &amp; Bảo hành 1 Đổi 1
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Kiểm định lấy ngay 15 phút tại 45 Showroom
                        </p>
                        <a
                            href="tel:18006869"
                            className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 hover:underline block font-mono tabular-nums pt-1"
                        >
                            1800 6869
                        </a>
                    </div>

                    <div className="bg-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-2">
                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                            <Store className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                            Trụ sở Flagship &amp; 45 Showroom
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Đang mở cửa • Đóng cửa lúc 21:30</span>
                        </p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 pt-1">
                            {contactInfo?.office?.numberOrAddress ||
                                "125 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh"}
                        </p>
                    </div>
                </div>

                {/* Form & Map */}
                <div className="grid gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-7 bg-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xs">
                        <p className="text-xs font-extrabold uppercase tracking-widest text-primary mb-1">
                            Gửi yêu cầu trực tuyến &amp; Hợp tác B2B
                        </p>
                        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">
                            Gửi tin nhắn hoặc Đính kèm Hồ sơ Năng lực
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Họ và tên / Tên doanh nghiệp *
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Nguyễn Minh Quân"
                                        required
                                        className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Số điện thoại liên hệ *
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        inputMode="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="0909 686 868"
                                        required
                                        className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm tabular-nums"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Email nhận phản hồi *
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="quan.nguyen@shopviet.vn"
                                        required
                                        className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="subject" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Chủ đề cần hỗ trợ *
                                    </Label>
                                    <Input
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Báo giá B2B / Hỗ trợ bảo hành..."
                                        required
                                        className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                    />
                                </div>
                            </div>

                            {/* File Attachment for B2B / Technical Support */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Đính kèm Hồ sơ năng lực B2B / Hình ảnh bảo hành (Tùy chọn)
                                </Label>
                                <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-dashed border-primary/40 bg-blue-50/40 dark:bg-blue-950/20 cursor-pointer">
                                    <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                                        <FileUp className="h-4 w-4 text-primary shrink-0" />
                                        <span>{attachedFile || "Tải lên PDF, DOCX, XLSX hoặc ảnh chụp thiết bị"}</span>
                                    </div>
                                    <span className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-bold">
                                        Chọn tệp
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0]
                                            if (f) setAttachedFile(f.name)
                                        }}
                                    />
                                </label>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="message" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Nội dung chi tiết *
                                </Label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Nhập nội dung yêu cầu của quý khách..."
                                    rows={4}
                                    required
                                    className="resize-none rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-xl bg-primary text-white hover:bg-primary/90 h-11 text-sm font-bold cursor-pointer"
                            >
                                {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu tới ShopViet"}
                            </Button>
                        </form>
                    </div>

                    <div className="lg:col-span-5 min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-900">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.513274621584!2d106.6972363!3d10.7719444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3f3129e64d%3A0x8d6b2d79522c7f30!2zMTI1IEzDqiBM4bujaSwgQuG6v24gVGjDoG5oLCBRdeG6rW4gMSwgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1743667684381!5m2!1svi!2s"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Bản đồ vị trí Flagship Showroom ShopViet"
                            className="absolute inset-0"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
