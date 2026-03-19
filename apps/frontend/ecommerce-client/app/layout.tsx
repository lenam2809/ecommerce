import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "./providers"
import { ToastProvider } from "@/components/toast/toast-provider"
import { GlobalLoading } from "@/components/ui/global-loading"
import { GuestIdInitializer } from "@/components/guest-id-initializer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ShopViet - Thương mại điện tử",
  description: "Nền tảng thương mại điện tử hàng đầu Việt Nam",
  icons: {
    icon: "/logo-icon.jpg", // hoặc có thể thêm các dạng khác nếu cần
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary-foreground`}>
        <GuestIdInitializer />
        <Providers>
          {children}
        </Providers>
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