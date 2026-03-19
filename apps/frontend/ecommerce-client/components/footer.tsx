// components/footer.tsx
import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative bg-background text-foreground border-t border-white/5 overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background opacity-50 pointer-events-none" />

      <div className="max-w-7xl relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Company Info */}
          <div className="space-y-6 lg:pr-8">
            <Link href="/" className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
              <Image
                src="/logo.png?height=40&width=120"
                alt="ShopViet Logo"
                width={120}
                height={40}
                className="h-9 w-auto dark:invert transition-transform duration-300 hover:scale-105"
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Mang đến trải nghiệm mua sắm tuyệt vời với sản phẩm chất lượng cao và dịch vụ khách hàng xuất sắc nhất.
            </p>
            <div className="flex items-center space-x-3">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-secondary/50 border border-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Facebook className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-secondary/50 border border-white/5 flex items-center justify-center text-muted-foreground hover:bg-[#E1306C] hover:text-white hover:border-[#E1306C] transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Instagram className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-secondary/50 border border-white/5 flex items-center justify-center text-muted-foreground hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Twitter className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase mb-6">Liên kết nhanh</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase mb-6">Dịch vụ khách hàng</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/shipping-policy" className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link href="/payment-methods" className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                  Phương thức thanh toán
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                  Bảo hành
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase mb-6">Liên hệ</h3>
            <ul className="space-y-5">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                <span className="text-muted-foreground text-sm leading-relaxed">48 Tố Hữu, Nam Từ Liêm, Hà Nội</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-muted-foreground mr-3" />
                <span className="text-muted-foreground text-sm">0975 431 485</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-muted-foreground mr-3" />
                <span className="text-muted-foreground text-sm">support@shopviet.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} ShopViet. Tất cả các quyền được bảo lưu.
          </p>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground/60">
            <span>Designed for Premium Tech Experience</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

