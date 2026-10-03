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
    "Trải nghiệm hệ sinh thái thiết bị thông minh đỉnh cao. Tinh giản trong thiết kế, vượt trội trong hiệu năng và tối ưu riêng cho nhịp sống hiện đại.",
  buttonText: "Khám phá bộ sưu tập",
  buttonLink: "/products",
}

export function Hero({ banners }: HeroProps) {
  const slide = banners?.find((b) => b.isActive) ?? banners?.[0]

  const title = slide?.title || FALLBACK.title
  const description = slide?.description || FALLBACK.description
  const buttonText = slide?.buttonText || FALLBACK.buttonText
  const buttonLink = slide?.buttonLink || FALLBACK.buttonLink
  const imageUrl = slide?.imageUrl || "/hero-showcase.webp"

  return (
    <section className="relative bg-background overflow-hidden border-b border-line/40">
      {/* Background ambient subtle glow */}
      <div
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="container-app grid lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-8 pb-14 md:pt-14 md:pb-20">
        {/* Left Column: Editorial Typography & CTAs (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col justify-center animate-fade-up">
          {/* Micro-badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft text-brand text-tiny font-semibold tracking-wider uppercase w-fit mb-5">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            <span>Thế hệ công nghệ mới · 2026</span>
          </div>

          {/* Headline Display */}
          <h1 className="text-display font-semibold tracking-tight text-ink max-w-2xl leading-[1.08]">
            {title}
          </h1>

          {/* Subtext */}
          <p className="mt-5 max-w-xl text-body-lg text-ink-soft leading-relaxed font-normal">
            {description}
          </p>

          {/* Action Button Group */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              href={buttonLink}
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-brand text-white text-small font-semibold hover:bg-brand-hover transition-all duration-200 focus-ring shadow-sm hover:shadow-md hover:scale-[1.01]"
            >
              {buttonText}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/products?sort=newest"
              className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-line bg-surface/50 text-ink text-small font-semibold hover:border-ink/60 hover:bg-surface transition-all duration-200 focus-ring"
            >
              Xem hàng mới về
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-10 pt-8 border-t border-line/60 grid grid-cols-3 gap-4 max-w-lg text-tiny text-ink-faint">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-full bg-brand-soft text-brand shrink-0">
                <Zap className="h-3.5 w-3.5" />
              </span>
              <span className="font-medium text-ink-soft">Giao 2H toàn quốc</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-full bg-brand-soft text-brand shrink-0">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              <span className="font-medium text-ink-soft">Bảo hành 24T chính hãng</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-full bg-brand-soft text-brand shrink-0">
                <Headphones className="h-3.5 w-3.5" />
              </span>
              <span className="font-medium text-ink-soft">1 đổi 1 trong 30 ngày</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Showcase (5 cols on lg) */}
        <div className="lg:col-span-5 relative">
          <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/5] rounded-3xl overflow-hidden bg-surface border border-line shadow-sm group">
            <Image
              src={imageUrl}
              alt={title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-103"
            />

            {/* Subtle bottom gradient overlay for card readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

            {/* Floating Spec Pill 1 (Top Left) */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/85 backdrop-blur-md border border-line/80 shadow-xs text-tiny font-medium text-ink">
              <span className="h-2 w-2 rounded-full bg-brand animate-ping" />
              <span>Titanium Grade 5 · Siêu nhẹ</span>
            </div>

            {/* Floating Spec Pill 2 (Bottom Right) */}
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-background/90 backdrop-blur-md border border-line/80 shadow-sm text-tiny font-medium text-ink">
              <Headphones className="h-3.5 w-3.5 text-brand" />
              <span>Spatial Audio vòm 360°</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
