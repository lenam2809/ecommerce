// app/(routes)/about/page.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronRight, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAbout } from "@/hooks/use-about"


export default function AboutPage() {

    const { data: aboutInfo, isFetching: isLoading } = useAbout();

    // Hiển thị trạng thái đang tải
    if (isLoading) {
        return (
            <div className="container-app py-12 flex justify-center items-center min-h-[50vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                    <p className="text-ink-soft">Đang tải thông tin giới thiệu...</p>
                </div>
            </div>
        )
    }


    // Hiển thị trang giới thiệu với dữ liệu đã tải
    return (
        <div className="container-app py-10 md:py-16 space-y-16 md:space-y-24">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-tiny text-ink-faint">
                <Link href="/" className="hover:text-brand transition-colors">
                    Trang Chủ
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium text-ink-soft">Giới Thiệu</span>
            </nav>

            {/* Hero Section */}
            {aboutInfo && (
                <div className="grid gap-10 md:grid-cols-2 items-center">
                    <div className="space-y-6">
                        <p className="section-label">Về ShopViet</p>
                        <h1 className="text-display font-semibold tracking-tight text-ink leading-[1.08]">
                            {aboutInfo.hero.title}
                        </h1>
                        <p className="text-body text-ink-soft leading-relaxed">
                            {aboutInfo.hero.description}
                        </p>
                        <div className="pt-4">
                            <Link href="/contact">
                                <Button className="rounded-full bg-brand text-white hover:bg-brand-hover px-8 h-12 text-small font-semibold">Liên Hệ Với Chúng Tôi</Button>
                            </Link>
                        </div>
                    </div>
                    <div className="relative h-[320px] md:h-[480px] rounded-3xl overflow-hidden bg-surface border border-line">
                        <Image
                            src="/placeholder.svg?height=800&width=1200"
                            alt="Đội ngũ làm việc cùng nhau"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>
            )}

            {/* Mission & Values */}
            {aboutInfo && (
                <div>
                    <div className="section-heading !mb-10">
                        <p className="section-label">Giá trị cốt lõi</p>
                        <h2 className="section-title">Sứ Mệnh & Giá Trị</h2>
                    </div>
                    <div className="grid gap-4 md:gap-6 md:grid-cols-3">
                        {aboutInfo.values.map((value, index) => (
                            <div key={index} className="bg-card border border-line rounded-2xl p-7 md:p-8 hover:border-ink/30 transition-colors">
                                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-brand-soft text-brand text-h3 font-bold mb-5">
                                    {index + 1}
                                </span>
                                <h3 className="text-h3 font-semibold text-ink mb-3">{value.title}</h3>
                                <p className="text-ink-soft leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Company History */}
            {aboutInfo && (
                <div className="grid gap-10 md:grid-cols-2 items-center">
                    <div className="order-2 md:order-1 space-y-6">
                        <p className="section-label">Hành trình</p>
                        <h3 className="text-h1 font-semibold tracking-tight text-ink mb-4">{aboutInfo.history.title}</h3>
                        <div className="space-y-4">
                            {aboutInfo.history.paragraphs.map((paragraph, index) => (
                                <p key={index} className="text-ink-soft leading-relaxed">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                    <div className="relative h-[280px] md:h-[400px] rounded-3xl overflow-hidden bg-surface border border-line order-1 md:order-2">
                        <Image src="/placeholder.svg?height=600&width=800" alt="Lịch sử công ty" fill className="object-cover" />
                    </div>
                </div>
            )}

            {/* Team Section */}
            {aboutInfo && (
                <div>
                    <div className="section-heading !mb-10">
                        <p className="section-label">Con người</p>
                        <h2 className="section-title">Đội Ngũ Của Chúng Tôi</h2>
                    </div>
                    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {aboutInfo.team.map((member, index) => (
                            <div key={index} className="bg-card border border-line rounded-2xl p-6 text-center hover:border-ink/30 transition-colors">
                                <div className="relative h-32 w-32 mx-auto rounded-full overflow-hidden mb-5 bg-surface">
                                    <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                                </div>
                                <h3 className="text-h3 font-semibold text-ink mb-1">{member.name}</h3>
                                <p className="text-tiny text-brand font-medium mb-3 uppercase tracking-wider">{member.role}</p>
                                <p className="text-tiny text-ink-soft leading-relaxed">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CTA Section */}
            {aboutInfo && (
                <div className="bg-surface border border-line rounded-3xl p-10 md:p-16 text-center">
                    <h2 className="text-h1 font-semibold tracking-tight text-ink mb-4">{aboutInfo.cta.title}</h2>
                    <p className="text-ink-soft mb-8 max-w-2xl mx-auto">{aboutInfo.cta.description}</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/products">
                            <Button className="rounded-full bg-brand text-white hover:bg-brand-hover px-8 h-12 text-small font-semibold">
                                Mua Sắm Ngay <ArrowRight className="h-4 w-4 ml-1.5" />
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="outline" className="rounded-full border-line text-ink hover:bg-card h-12 px-8 text-small font-semibold">
                                Liên Hệ
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
