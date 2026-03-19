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
    const [error, setError] = useState<string | null>(null)

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
            <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Đang tải thông tin liên hệ...</p>
                </div>
            </div>
        )
    }

    // Hiển thị trạng thái lỗi
    if (error) {
        return (
            <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>Thử Lại</Button>
                </div>
            </div>
        )
    }

    // Hiển thị trang liên hệ với dữ liệu đã tải
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-12">
                <Link href="/" className="hover:text-foreground transition-colors">
                    Trang Chủ
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-foreground">Liên Hệ</span>
            </div>

            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-5xl tech-heading mb-6 tracking-tight">Liên Hệ Với Chúng Tôi</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Bạn có câu hỏi về sản phẩm hoặc dịch vụ của chúng tôi? Chúng tôi luôn sẵn sàng hỗ trợ và rất mong được nghe từ
                    bạn.
                </p>
            </div>

            {/* Contact Information Cards */}
            {contactInfo && (
                <div className="grid gap-8 md:grid-cols-3 mb-16">
                    <div className="glass-card p-8 rounded-3xl text-center hover:bg-secondary/20 transition-colors group">
                        <div className="bg-primary/10 p-4 rounded-full mb-6 mx-auto w-16 h-16 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Phone className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Điện Thoại</h3>
                        <p className="text-muted-foreground mb-4 text-sm">{contactInfo.phone.hoursOrDescription}</p>
                        <a href={`tel:${contactInfo.phone.numberOrAddress.replace(/\s+/g, "")}`} className="text-xl font-semibold text-primary hover:underline">
                            {contactInfo.phone.numberOrAddress}
                        </a>
                    </div>

                    <div className="glass-card p-8 rounded-3xl text-center hover:bg-secondary/20 transition-colors group">
                        <div className="bg-primary/10 p-4 rounded-full mb-6 mx-auto w-16 h-16 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Mail className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Email</h3>
                        <p className="text-muted-foreground mb-4 text-sm">{contactInfo.email.hoursOrDescription}</p>
                        <a href={`mailto:${contactInfo.email.numberOrAddress}`} className="text-xl font-semibold text-primary hover:underline">
                            {contactInfo.email.numberOrAddress}
                        </a>
                    </div>

                    <div className="glass-card p-8 rounded-3xl text-center hover:bg-secondary/20 transition-colors group">
                        <div className="bg-primary/10 p-4 rounded-full mb-6 mx-auto w-16 h-16 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <MapPin className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Văn Phòng</h3>
                        <p className="text-muted-foreground mb-4 text-sm">{contactInfo.office.hoursOrDescription}</p>
                        <address className="not-italic text-lg font-medium whitespace-pre-line">{contactInfo.office.numberOrAddress}</address>
                    </div>
                </div>
            )}

            {/* Contact Form and Map */}
            <div className="grid gap-12 lg:grid-cols-2 mb-16">
                <div className="glass-card p-8 rounded-3xl">
                    <h2 className="text-3xl tech-heading mb-8">Gửi Tin Nhắn Cho Chúng Tôi</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="tech-label">Họ Tên</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nguyễn Văn A"
                                    required
                                    className="h-12 bg-secondary/30 border-transparent focus:border-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="tech-label">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="nguyenvana@example.com"
                                    required
                                    className="h-12 bg-secondary/30 border-transparent focus:border-primary/50"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="tech-label">Tiêu Đề</Label>
                            <Input
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Chúng tôi có thể giúp gì cho bạn?"
                                required
                                className="h-12 bg-secondary/30 border-transparent focus:border-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message" className="tech-label">Nội Dung</Label>
                            <Textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Nội dung tin nhắn của bạn..."
                                rows={6}
                                required
                                className="resize-none bg-secondary/30 border-transparent focus:border-primary/50"
                            />
                        </div>
                        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full btn-glow rounded-xl h-12 text-base">
                            {isSubmitting ? "Đang Gửi..." : "Gửi Tin Nhắn"}
                        </Button>
                    </form>
                </div>
                <div className="h-full min-h-[400px]">
                    <div className="h-full rounded-3xl overflow-hidden glass-card border-0 shadow-lg relative">
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
                    <h2 className="text-3xl tech-heading mb-6">Kết Nối Với Chúng Tôi</h2>
                    <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Theo dõi chúng tôi trên mạng xã hội để cập nhật các sản phẩm mới nhất, khuyến mãi và tin tức.
                    </p>
                    <div className="flex flex-wrap justify-center gap-8">
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
                                        className={`flex items-center justify-center p-4 rounded-full bg-background shadow-lg transition-all duration-300 transform hover:scale-110 hover:shadow-xl ring-1 ring-black/5 dark:ring-white/10`}
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
                                        <Icon
                                            className="h-8 w-8 transition-all duration-300"
                                            style={{
                                                filter: platform.name === "Instagram" ? "drop-shadow(0 0 3px rgba(0, 0, 0, 0.2))" : "none",
                                            }}
                                        />
                                    </a>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* FAQ Section */}
            {contactInfo && (
                <div className="glass-card p-12 rounded-3xl bg-secondary/5">
                    <h2 className="text-3xl tech-heading mb-8 text-center">Câu Hỏi Thường Gặp</h2>
                    <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
                        {contactInfo.faqs.map((faq, index) => (
                            <div key={index} className="space-y-3 p-6 rounded-2xl bg-background/50 border border-white/5 hover:bg-background transition-colors">
                                <h3 className="font-bold text-lg text-primary">{faq.question}</h3>
                                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

