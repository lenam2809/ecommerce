// app/(routes)/contact/page.tsx
"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react"

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
        subject: "",
        message: "",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error] = useState<string | null>(null)

    const { data: contactInfo, isLoading: isLoading } = useContact();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Giả lập gửi form
        await new Promise((resolve) => setTimeout(resolve, 1500))

        AppToaster.success("Đã Gửi Tin Nhắn", {
            description: "Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi sớm.",
        })

        setFormData({
            name: "",
            email: "",
            subject: "",
            message: "",
        })
        setIsSubmitting(false)
    }

    // Hiển thị trạng thái đang tải
    if (isLoading) {
        return (
            <div className="container-app py-12 flex justify-center items-center min-h-[50vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                    <p className="text-ink-soft">Đang tải thông tin liên hệ...</p>
                </div>
            </div>
        )
    }

    // Hiển thị trạng thái lỗi
    if (error) {
        return (
            <div className="container-app py-12 flex justify-center items-center min-h-[50vh]">
                <div className="text-center">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()} className="rounded-full bg-brand text-white hover:bg-brand-hover h-11 px-6 text-small font-semibold">Thử Lại</Button>
                </div>
            </div>
        )
    }

    // Hiển thị trang liên hệ với dữ liệu đã tải
    return (
        <div className="container-app py-10 md:py-16">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-tiny text-ink-faint mb-12">
                <Link href="/" className="hover:text-brand transition-colors">
                    Trang Chủ
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium text-ink-soft">Liên Hệ</span>
            </nav>

            {/* Hero Section */}
            <div className="text-center mb-16">
                <p className="section-label mb-3">Liên hệ</p>
                <h1 className="text-display font-semibold tracking-tight text-ink mb-6">Liên Hệ Với Chúng Tôi</h1>
                <p className="text-body text-ink-soft max-w-2xl mx-auto leading-relaxed">
                    Bạn có câu hỏi về sản phẩm hoặc dịch vụ của chúng tôi? Chúng tôi luôn sẵn sàng hỗ trợ và rất mong được nghe từ
                    bạn.
                </p>
            </div>

            {/* Contact Information Cards */}
            {contactInfo && (
                <div className="grid gap-4 md:gap-6 md:grid-cols-3 mb-16">
                    <div className="bg-card border border-line rounded-2xl p-8 text-center hover:border-ink/30 transition-colors group">
                        <div className="bg-brand-soft p-4 rounded-full mb-6 mx-auto w-16 h-16 flex items-center justify-center">
                            <Phone className="h-8 w-8 text-brand" />
                        </div>
                        <h3 className="text-h3 font-semibold text-ink mb-2">Điện Thoại</h3>
                        <p className="text-ink-soft mb-4 text-tiny">{contactInfo.phone.hoursOrDescription}</p>
                        <a href={`tel:${contactInfo.phone.numberOrAddress.replace(/\s+/g, "")}`} className="text-h3 font-semibold text-brand hover:underline">
                            {contactInfo.phone.numberOrAddress}
                        </a>
                    </div>

                    <div className="bg-card border border-line rounded-2xl p-8 text-center hover:border-ink/30 transition-colors group">
                        <div className="bg-brand-soft p-4 rounded-full mb-6 mx-auto w-16 h-16 flex items-center justify-center">
                            <Mail className="h-8 w-8 text-brand" />
                        </div>
                        <h3 className="text-h3 font-semibold text-ink mb-2">Email</h3>
                        <p className="text-ink-soft mb-4 text-tiny">{contactInfo.email.hoursOrDescription}</p>
                        <a href={`mailto:${contactInfo.email.numberOrAddress}`} className="text-h3 font-semibold text-brand hover:underline break-all">
                            {contactInfo.email.numberOrAddress}
                        </a>
                    </div>

                    <div className="bg-card border border-line rounded-2xl p-8 text-center hover:border-ink/30 transition-colors group">
                        <div className="bg-brand-soft p-4 rounded-full mb-6 mx-auto w-16 h-16 flex items-center justify-center">
                            <MapPin className="h-8 w-8 text-brand" />
                        </div>
                        <h3 className="text-h3 font-semibold text-ink mb-2">Văn Phòng</h3>
                        <p className="text-ink-soft mb-4 text-tiny">{contactInfo.office.hoursOrDescription}</p>
                        <address className="not-italic text-body font-medium text-ink whitespace-pre-line">{contactInfo.office.numberOrAddress}</address>
                    </div>
                </div>
            )}

            {/* Contact Form and Map */}
            <div className="grid gap-10 lg:grid-cols-2 mb-16">
                <div className="bg-card border border-line rounded-3xl p-6 md:p-8">
                    <p className="section-label mb-1">Nhắn tin</p>
                    <h2 className="text-h1 font-semibold tracking-tight text-ink mb-8">Gửi Tin Nhắn Cho Chúng Tôi</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-tiny font-medium uppercase tracking-wider text-ink-faint">Họ Tên</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nguyễn Văn A"
                                    required
                                    className="h-12 bg-surface border-line focus:border-brand/60"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-tiny font-medium uppercase tracking-wider text-ink-faint">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="nguyenvana@example.com"
                                    required
                                    className="h-12 bg-surface border-line focus:border-brand/60"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-tiny font-medium uppercase tracking-wider text-ink-faint">Tiêu Đề</Label>
                            <Input
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Chúng tôi có thể giúp gì cho bạn?"
                                required
                                className="h-12 bg-surface border-line focus:border-brand/60"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message" className="text-tiny font-medium uppercase tracking-wider text-ink-faint">Nội Dung</Label>
                            <Textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Nội dung tin nhắn của bạn..."
                                rows={6}
                                required
                                className="resize-none bg-surface border-line focus:border-brand/60"
                            />
                        </div>
                        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full rounded-full bg-brand text-white hover:bg-brand-hover h-12 text-small font-semibold">
                            {isSubmitting ? "Đang Gửi..." : "Gửi Tin Nhắn"}
                        </Button>
                    </form>
                </div>
                <div className="h-full min-h-[400px]">
                    <div className="h-full rounded-3xl overflow-hidden border border-line relative bg-surface">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1862.4285288592966!2d105.79340843922351!3d20.998366263847014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135acba7ddb0f43%3A0xe7d7c05f85f830a!2zNDggUC4gVOG7kSBI4buvdSwgVHJ1bmcgVsSDbiwgTmFtIFThu6sgTGnDqm0sIEjDoCBO4buZaSAxMDAwMCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1743667684381!5m2!1svi!2s"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Bản đồ vị trí văn phòng"
                            aria-label="Bản đồ Google Maps hiển thị vị trí văn phòng"
                            className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-700"
                        />
                    </div>
                </div>
            </div>

            {/* Social Media */}
            {contactInfo && (
                <div className="text-center mb-16">
                    <p className="section-label mb-2">Mạng xã hội</p>
                    <h2 className="section-title mb-6">Kết Nối Với Chúng Tôi</h2>
                    <p className="text-ink-soft mb-10 max-w-2xl mx-auto">
                        Theo dõi chúng tôi trên mạng xã hội để cập nhật các sản phẩm mới nhất, khuyến mãi và tin tức.
                    </p>
                    <div className="flex flex-wrap justify-center gap-5">
                        {contactInfo.social.map((platform, index) => {
                            let Icon = Facebook
                            if (platform.name === "Twitter") Icon = Twitter
                            if (platform.name === "Instagram") Icon = Instagram
                            if (platform.name === "LinkedIn") Icon = Linkedin
                            if (platform.name === "YouTube") Icon = Youtube

                            return (
                                <div key={index} className="relative group">
                                    <a
                                        href={platform.url}
                                        className={`flex items-center justify-center h-14 w-14 rounded-full bg-card border border-line shadow-sm transition-all duration-300 transform hover:scale-110`}
                                        style={{
                                            color: platform.name === "Instagram" ? "#E1306C"
                                                : platform.name === "Twitter" ? "#1DA1F2" :
                                                    platform.name === "LinkedIn" ? "#0A66C2" :
                                                        platform.name === "YouTube" ? "#FF0000" :
                                                            platform.name === "Facebook" ? "#1877F2" : "",
                                        }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={platform.name}
                                    >
                                        <Icon className="h-6 w-6" />
                                    </a>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* FAQ Section */}
            {contactInfo && (
                <div className="bg-surface border border-line rounded-3xl p-10 md:p-14">
                    <div className="section-heading !mb-10 text-center">
                        <p className="section-label">Hỗ trợ</p>
                        <h2 className="section-title">Câu Hỏi Thường Gặp</h2>
                    </div>
                    <div className="grid gap-4 md:gap-6 md:grid-cols-2 max-w-5xl mx-auto">
                        {contactInfo.faqs.map((faq, index) => (
                            <div key={index} className="space-y-2 p-6 rounded-2xl bg-card border border-line hover:border-ink/30 transition-colors">
                                <h3 className="font-semibold text-h3 text-ink">{faq.question}</h3>
                                <p className="text-ink-soft leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
