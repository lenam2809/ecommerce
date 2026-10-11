import { ReactNode } from "react";
import Footer from "@/components/footer";
import { Header } from "@/components/header/index";

interface RoutesLayoutProps {
    children: ReactNode;
}

export default function RoutesLayout({ children }: RoutesLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow pt-16 md:pt-[72px]">
                {children}
            </main>
            <Footer />
        </div>
    );
}
