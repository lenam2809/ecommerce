// app/(routes)/about/page.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAbout } from "@/hooks/use-about"


export default function AboutPage() {

    const { data: aboutInfo, isFetching: isLoading } = useAbout();

    // Hiển thị trạng thái đang tải
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Đang tải thông tin giới thiệu...</p>
                </div>
            </div>
        )
    }


    // Hiển thị trang giới thiệu với dữ liệu đã tải
    return (
        <div className="container mx-auto px-4 py-12 space-y-20">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
                <Link href="/" className="hover:text-foreground transition-colors">
                    Trang Chủ
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-foreground">Giới Thiệu</span>
            </div>

            {/* Hero Section */}
            {aboutInfo && (
                <div className="grid gap-12 md:grid-cols-2 items-center">
                    <div className="space-y-6">
                        <h1 className="text-5xl tech-heading leading-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            {aboutInfo.hero.title}
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            {aboutInfo.hero.description}
                        </p>
                        <div className="pt-4">
                            <Link href="/contact">
                                <Button size="lg" className="btn-glow rounded-full px-8">Liên Hệ Với Chúng Tôi</Button>
                            </Link>
                        </div>
                    </div>
                    <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden glass-card border-0 shadow-2xl">
                        <Image
                            src="/placeholder.svg?height=800&width=1200"
                            alt="Đội ngũ làm việc cùng nhau"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                </div>
            )}

            {/* Mission & Values */}
            {aboutInfo && (
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10 rounded-full opacity-50" />
                    <h2 className="text-3xl tech-heading mb-12 text-center">Sứ Mệnh & Giá Trị</h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        {aboutInfo.values.map((value, index) => (
                            <div key={index} className="glass-card hover:bg-secondary/20 transition-colors p-8 rounded-3xl border-white/10">
                                <h3 className="text-xl font-bold mb-4 text-primary">{value.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Company History */}
            {aboutInfo && (
                <div className="grid gap-12 md:grid-cols-2 items-center">
                    <div className="order-2 md:order-1 space-y-6">
                        <h3 className="text-3xl tech-heading mb-4 border-l-4 border-primary pl-4">{aboutInfo.history.title}</h3>
                        <div className="space-y-4">
                            {aboutInfo.history.paragraphs.map((paragraph, index) => (
                                <p key={index} className="text-muted-foreground leading-relaxed">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                    <div className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden glass-card border-0 order-1 md:order-2">
                        <Image src="/placeholder.svg?height=600&width=800" alt="Lịch sử công ty" fill className="object-cover" />
                    </div>
                </div>
            )}

            {/* Team Section */}
            {aboutInfo && (
                <div>
                    <h2 className="text-3xl tech-heading mb-12 text-center">Đội Ngũ Của Chúng Tôi</h2>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {aboutInfo.team.map((member, index) => (
                            <div key={index} className="glass-card p-6 rounded-3xl text-center hover:scale-105 transition-transform duration-300">
                                <div className="relative h-40 w-40 mx-auto rounded-full overflow-hidden mb-6 ring-4 ring-primary/20">
                                    <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                                </div>
                                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                                <p className="text-sm text-primary font-medium mb-3 uppercase tracking-wide">{member.role}</p>
                                <p className="text-sm text-muted-foreground">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CTA Section */}
            {aboutInfo && (
                <div className="glass-card p-12 rounded-3xl text-center bg-gradient-to-br from-secondary/30 to-background border-white/10">
                    <h2 className="text-3xl tech-heading mb-4">{aboutInfo.cta.title}</h2>
                    <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">{aboutInfo.cta.description}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/products">
                            <Button size="lg" className="btn-primary rounded-full px-8 py-6 h-auto text-lg">
                                Mua Sắm Ngay
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="rounded-full px-8 py-6 h-auto text-lg border-primary/20 hover:bg-primary/10 hover:text-primary">
                                Liên Hệ
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

