import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "./providers"
import { ToastProvider } from "@/components/toast/toast-provider"
import { GlobalLoading } from "@/components/ui/global-loading"
import { GuestIdInitializer } from "@/components/guest-id-initializer"
import { ErrorBoundary } from "@/components/error-boundary"
import { generateOrganizationSchema } from "@/lib/seo-utils"

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "ShopViet - Thương mại điện tử Việt Nam",
  description: "Nền tảng thương mại điện tử hàng đầu Việt Nam - Mua sắm trực tuyến dễ dàng, an toàn và giá tốt nhất",
  keywords: ["thương mại điện tử", "mua hàng online", "shopviet", "bán hàng trực tuyến"],
  authors: [{ name: "ShopViet Team" }],
  icons: {
    icon: "/logo-icon.jpg",
  },
  openGraph: {
    title: "ShopViet - Thương mại điện tử Việt Nam",
    description: "Nền tảng thương mại điện tử hàng đầu Việt Nam - Mua sắm trực tuyến dễ dàng, an toàn và giá tốt nhất",
    url: "https://shopviet.com",
    siteName: "ShopViet",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopViet - Thương mại điện tử Việt Nam",
    description: "Nền tảng thương mại điện tử hàng đầu Việt Nam",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://shopviet.com",
  },
  category: "e-commerce",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = generateOrganizationSchema()

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Organization structured data — helps Google identify the business entity */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className={`${inter.variable} font-sans bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary-foreground`}>
        <GuestIdInitializer />
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
        <GlobalLoading />
        <ToastProvider
          position="bottom-right"
          visibleToasts={5}
          duration={5000}
          closeButton
          richColors
          expand
          gap={16}
          offset={24}
        />
      </body>
    </html>
  );
}
