import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ContactForm from "@/components/helps/contact-form"

export const metadata: Metadata = {
    title: "Liên hệ hỗ trợ | E-commerce Dashboard",
    description: "Liên hệ với đội ngũ hỗ trợ của chúng tôi",
}

export default function ContactPage() {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <Button variant="ghost" asChild className="mb-6">
                    <Link href="/help">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại Trung tâm trợ giúp
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Liên hệ hỗ trợ</CardTitle>
                        <CardDescription>
                            Điền thông tin bên dưới và đội ngũ hỗ trợ của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ContactForm />
                    </CardContent>
                </Card>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hỗ trợ qua điện thoại</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-2">Thời gian làm việc: 8:00 - 20:00 (Thứ 2 - Chủ nhật)</p>
                            <p className="font-medium">1900 1234 56</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Email hỗ trợ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-2">Phản hồi trong vòng 24 giờ</p>
                            <p className="font-medium">hotro@ecommerce.vn</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
