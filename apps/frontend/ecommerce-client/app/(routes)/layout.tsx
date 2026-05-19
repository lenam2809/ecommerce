import { ReactNode } from "react";
import Footer from "@/components/footer";
import { Header } from "@/components/header/index";
import { CartProvider } from "@/components/provider/cart-provider";
import { WishlistProvider } from "@/components/provider/wishlist-provider";

interface RoutesLayoutProps {
    children: ReactNode;
}

export default function RoutesLayout({ children }: RoutesLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <CartProvider>
                <WishlistProvider>
                    <Header />
                    <main className="flex-grow pt-16 md:pt-20">
                        {children}
                    </main>
                    <Footer />
                </WishlistProvider>
            </CartProvider>
        </div>
    );
}
