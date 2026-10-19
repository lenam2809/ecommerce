"use client"

import { useState } from "react"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ChevronDown, ShieldCheck, Truck, Headphones } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Footer() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    quickLinks: false,
    customerService: false,
    contactInfo: false,
  })

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <footer className="relative bg-background text-foreground border-t border-line overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background opacity-50 pointer-events-none" />

      {/* Top Value Proposition Strip */}
      <div className="border-b border-line/60 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <span className="p-2.5 rounded-full bg-primary/10 text-primary shrink-0">
                <Truck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-foreground">Miễn phí giao hàng</p>
                <p className="text-tiny text-muted-foreground">Toàn quốc cho đơn từ 500.000₫</p>
              </div>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <span className="p-2.5 rounded-full bg-primary/10 text-primary shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-foreground">100% Chính hãng</p>
                <p className="text-tiny text-muted-foreground">Bảo hành ủy quyền tới 24 tháng</p>
              </div>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <span className="p-2.5 rounded-full bg-primary/10 text-primary shrink-0">
                <Headphones className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-foreground">Tổng đài miễn phí</p>
                <p className="text-tiny text-muted-foreground">1800 6868 (CSKH) • 1800 6869 (Kỹ thuật)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Desktop 4-column Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Company Info */}
          <div className="space-y-5 lg:pr-4">
            <Link href="/" className="inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md group">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                Shop<span className="text-primary font-bold">Viet.</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-primary inline-block translate-y-0.5 group-hover:scale-125 transition-transform duration-200" />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Hệ thống bán lẻ thiết bị công nghệ chính hãng hàng đầu Việt Nam. Trải nghiệm mua sắm chuẩn mực, bảo hành ủy quyền toàn diện 24 tháng.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-surface-2 border border-line flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-surface-2 border border-line flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-surface-2 border border-line flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase mb-5">Liên kết nhanh</h3>
            <ul className="space-y-3.5">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                  So sánh thiết bị
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                  Liên hệ hợp tác
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase mb-5">Chính sách & Hỗ trợ</h3>
            <ul className="space-y-3.5">
              <li>
                <Link href="/shipping-policy" className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                  Chính sách vận chuyển (Freeship từ 500k)
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                  Chính sách bảo hành 24 tháng
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                  Đổi trả 1-đổi-1 trong 30 ngày
                </Link>
              </li>
              <li>
                <Link href="/payment-methods" className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                  Phương thức thanh toán & VNPay
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info (SSoT 2026) */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase mb-5">Hệ thống & Liên hệ</h3>
            <ul className="space-y-3.5">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 text-primary mr-2.5 mt-1 shrink-0" />
                <span className="text-muted-foreground text-sm leading-relaxed">
                  <strong className="text-foreground font-semibold">45 Showroom công nghệ</strong> toàn quốc (Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ, Hải Phòng)
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 text-primary mr-2.5 shrink-0" />
                <div className="text-sm text-muted-foreground">
                  CSKH & Mua hàng: <a href="tel:18006868" className="text-foreground font-bold hover:text-primary transition-colors tabular-nums">1800 6868</a>
                </div>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 text-primary mr-2.5 shrink-0" />
                <div className="text-sm text-muted-foreground">
                  Kỹ thuật & Bảo hành: <a href="tel:18006869" className="text-foreground font-bold hover:text-primary transition-colors tabular-nums">1800 6869</a>
                </div>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 text-primary mr-2.5 shrink-0" />
                <a href="mailto:support@shopviet.vn" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  support@shopviet.vn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile Accordion View */}
        <div className="md:hidden space-y-4">
          {/* Mobile Brand Info */}
          <div className="pb-4 border-b border-line">
            <Link href="/" className="inline-flex items-center gap-1.5 rounded-md group">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                Shop<span className="text-primary font-bold">Viet.</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-primary inline-block translate-y-0.5" />
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed mt-2">
              Hệ thống 45 Showroom công nghệ toàn quốc. 100% chính hãng, bảo hành ủy quyền 24 tháng.
            </p>
            <div className="flex items-center space-x-3 pt-3">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-surface-2 border border-line flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors"
              >
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-surface-2 border border-line flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors"
              >
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-surface-2 border border-line flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors"
              >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          {/* Accordion 1: Quick Links */}
          <div className="border-b border-line pb-2">
            <button
              onClick={() => toggleSection("quickLinks")}
              className="w-full flex items-center justify-between py-2 text-sm font-semibold text-foreground uppercase tracking-wider text-left"
              aria-expanded={openSections.quickLinks}
            >
              <span>Liên kết nhanh</span>
              <ChevronDown
                className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", openSections.quickLinks && "rotate-180")}
              />
            </button>
            <div className={cn("overflow-hidden transition-all duration-200", openSections.quickLinks ? "max-h-48 pt-2 pb-2" : "max-h-0")}>
              <ul className="space-y-2.5 pl-1">
                <li><Link href="/about" className="text-muted-foreground text-xs hover:text-foreground">Về chúng tôi</Link></li>
                <li><Link href="/products" className="text-muted-foreground text-xs hover:text-foreground">Tất cả sản phẩm</Link></li>
                <li><Link href="/compare" className="text-muted-foreground text-xs hover:text-foreground">So sánh thiết bị</Link></li>
                <li><Link href="/contact" className="text-muted-foreground text-xs hover:text-foreground">Liên hệ hợp tác</Link></li>
              </ul>
            </div>
          </div>

          {/* Accordion 2: Customer Service */}
          <div className="border-b border-line pb-2">
            <button
              onClick={() => toggleSection("customerService")}
              className="w-full flex items-center justify-between py-2 text-sm font-semibold text-foreground uppercase tracking-wider text-left"
              aria-expanded={openSections.customerService}
            >
              <span>Chính sách & Hỗ trợ</span>
              <ChevronDown
                className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", openSections.customerService && "rotate-180")}
              />
            </button>
            <div className={cn("overflow-hidden transition-all duration-200", openSections.customerService ? "max-h-48 pt-2 pb-2" : "max-h-0")}>
              <ul className="space-y-2.5 pl-1">
                <li><Link href="/shipping-policy" className="text-muted-foreground text-xs hover:text-foreground">Chính sách vận chuyển (Freeship từ 500k)</Link></li>
                <li><Link href="/warranty" className="text-muted-foreground text-xs hover:text-foreground">Chính sách bảo hành 24 tháng</Link></li>
                <li><Link href="/return-policy" className="text-muted-foreground text-xs hover:text-foreground">Đổi trả 1-đổi-1 trong 30 ngày</Link></li>
                <li><Link href="/payment-methods" className="text-muted-foreground text-xs hover:text-foreground">Phương thức thanh toán & VNPay</Link></li>
              </ul>
            </div>
          </div>

          {/* Accordion 3: Contact & Showrooms */}
          <div className="border-b border-line pb-2">
            <button
              onClick={() => toggleSection("contactInfo")}
              className="w-full flex items-center justify-between py-2 text-sm font-semibold text-foreground uppercase tracking-wider text-left"
              aria-expanded={openSections.contactInfo}
            >
              <span>Hệ thống 45 Showroom & Hotline</span>
              <ChevronDown
                className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", openSections.contactInfo && "rotate-180")}
              />
            </button>
            <div className={cn("overflow-hidden transition-all duration-200", openSections.contactInfo ? "max-h-56 pt-2 pb-2" : "max-h-0")}>
              <div className="space-y-2 text-xs text-muted-foreground pl-1">
                <p><strong className="text-foreground">45 Showroom công nghệ:</strong> Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ, Hải Phòng...</p>
                <p>CSKH: <a href="tel:18006868" className="text-foreground font-bold hover:text-primary tabular-nums">1800 6868</a> (8h00 - 21h30)</p>
                <p>Kỹ thuật: <a href="tel:18006869" className="text-foreground font-bold hover:text-primary tabular-nums">1800 6869</a> (8h00 - 21h00)</p>
                <p>Email: <a href="mailto:support@shopviet.vn" className="text-foreground hover:text-primary">support@shopviet.vn</a></p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Guarantee Badges */}
        <div className="border-t border-line mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-muted-foreground text-xs">
            &copy; 2026 ShopViet E-Commerce. Tất cả các quyền được bảo lưu.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground/80">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success inline-block" />
              45 Showroom Toàn Quốc
            </span>
            <span>•</span>
            <span>Bảo hành ủy quyền 24 tháng</span>
            <span>•</span>
            <span>Freeship từ 500.000₫</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
