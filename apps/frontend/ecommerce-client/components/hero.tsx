"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles, ShieldCheck, Zap, Headphones } from "lucide-react"
import { Banner } from "@/types/banner"

interface HeroProps {
  banners: Banner[]
}

const FALLBACK = {
  title: "Công nghệ cho cuộc sống Việt",
  description:
    "Trải nghiệm hệ sinh thái thiết bị thông minh đỉnh cao. Tinh giản trong thiết kế, vượt trội trong hiệu năng và tối ưu riêng cho nhịp sống hiện đại cùng đặc quyền bảo hành VIP toàn diện.",
  buttonText: "Khám phá bộ sưu tập",
  buttonLink: "/products",
}

export function Hero({ banners }: HeroProps) {
  const slide = banners?.find((b) => b.isActive) ?? banners?.[0]

  const title = slide?.title || FALLBACK.title
  const rawDescription = slide?.description?.trim() || FALLBACK.description
  const description =
    rawDescription.length < 95
      ? `${rawDescription.replace(/\.$/, "")}. Tuyển tập thế hệ thiết bị flagship chính hãng với thiết kế nguyên khối tinh xảo, hiệu năng xử lý đột phá và đặc quyền hậu mãi tiêu chuẩn 5 sao tại ShopViet.`
      : rawDescription
  const buttonText = slide?.buttonText || FALLBACK.buttonText
  const buttonLink = slide?.buttonLink || FALLBACK.buttonLink
  const imageUrl = slide?.imageUrl || "/hero-showcase.webp"

  return (
    <section className="relative isolate bg-background overflow-hidden border-b border-line/40">
      {/* Background ambient subtle glow */}
      <div
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#e11d48]/10 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="container-app grid lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-8 pb-14 md:pt-14 md:pb-20">
        {/* Left Column: Editorial Typography & CTAs (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col justify-center animate-fade-up">
          {/* Micro-badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-soft text-[#e11d48] text-xs font-semibold tracking-wider uppercase w-fit mb-6 border border-[#e11d48]/20">
            <Sparkles className="h-3.5 w-3.5 text-[#e11d48]" />
            <span>Thế hệ công nghệ mới · 2026</span>
          </div>

          {/* Headline Display */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-[#f8fafc] max-w-2xl leading-[1.15]">
            {title}
          </h1>

          {/* Subtext */}
          <p className="mt-5 max-w-xl text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {description}
          </p>

          {/* Action Button Group */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              href={buttonLink}
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-[#e11d48] text-white text-sm font-semibold hover:bg-[#be123c] transition-all duration-200 focus-ring shadow-md hover:shadow-lg hover:scale-[1.01]"
            >
              <span>{buttonText}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/products?sort=newest"
              className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-border/80 dark:border-white/15 bg-white/80 dark:bg-[#111827] text-foreground text-sm font-semibold hover:bg-slate-100 dark:hover:bg-[#182234] transition-all duration-200 focus-ring"
            >
              Xem hàng mới về
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-10 pt-8 border-t border-line/60 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="p-1.5 rounded-full bg-primary/10 text-primary shrink-0">
                <Zap className="h-3.5 w-3.5" />
              </span>
              <span className="font-medium text-foreground">Giao 2H toàn quốc</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="p-1.5 rounded-full bg-primary/10 text-primary shrink-0">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              <span className="font-medium text-foreground">Bảo hành 24T chính hãng</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="p-1.5 rounded-full bg-primary/10 text-primary shrink-0">
                <Headphones className="h-3.5 w-3.5" />
              </span>
              <span className="font-medium text-foreground">1 đổi 1 trong 30 ngày</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Showcase (5 cols on lg) */}
        <div className="lg:col-span-5 relative">
          {/* Crimson Atelier Ambient Glow behind Hero Image */}
          <div
            className="absolute -inset-6 bg-[#e11d48]/20 rounded-full blur-3xl pointer-events-none z-0"
            aria-hidden="true"
          />

          <div className="relative z-10 aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/5] rounded-3xl overflow-hidden bg-surface border border-slate-200/80 dark:border-white/10 shadow-xl group">
            <Image
              src={imageUrl}
              alt={title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-103"
            />

            {/* Subtle bottom gradient overlay for card readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* Floating Spec Pill 1 (Top Left) */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#0b0f17]/85 backdrop-blur-md border border-slate-200/80 dark:border-white/15 shadow-sm text-xs font-semibold text-slate-900 dark:text-[#f8fafc]">
              <span className="h-2 w-2 rounded-full bg-[#e11d48] animate-ping" />
              <span>Titanium Grade 5 · Siêu nhẹ</span>
            </div>

            {/* Floating Spec Pill 2 (Bottom Right) */}
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#0b0f17]/85 backdrop-blur-md border border-slate-200/80 dark:border-white/15 shadow-sm text-xs font-semibold text-slate-900 dark:text-[#f8fafc]">
              <Headphones className="h-3.5 w-3.5 text-[#e11d48]" />
              <span>Spatial Audio vòm 360°</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
