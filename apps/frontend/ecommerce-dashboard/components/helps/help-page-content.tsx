"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// Define types for FAQ data
interface FAQItem {
    question: string
    answer: string
}

interface FAQData {
    account: FAQItem[]
    orders: FAQItem[]
    payment: FAQItem[]
    returns: FAQItem[]
}

// FAQ data organized by categories
const faqData: FAQData = {
    account: [
        {
            question: "Làm thế nào để tạo tài khoản mới?",
            answer:
                "Để tạo tài khoản mới, nhấp vào nút 'Đăng ký' ở góc trên bên phải của trang web. Điền thông tin cá nhân của bạn, bao gồm tên, email và mật khẩu. Sau đó, xác nhận email của bạn bằng cách nhấp vào liên kết được gửi đến địa chỉ email của bạn.",
        },
        {
            question: "Làm thế nào để thay đổi mật khẩu của tôi?",
            answer:
                "Để thay đổi mật khẩu, đăng nhập vào tài khoản của bạn, truy cập phần 'Cài đặt tài khoản', và chọn 'Thay đổi mật khẩu'. Nhập mật khẩu hiện tại của bạn, sau đó nhập và xác nhận mật khẩu mới.",
        },
        {
            question: "Làm thế nào để cập nhật thông tin cá nhân của tôi?",
            answer:
                "Để cập nhật thông tin cá nhân, đăng nhập vào tài khoản của bạn và truy cập phần 'Hồ sơ'. Tại đây, bạn có thể chỉnh sửa tên, địa chỉ, số điện thoại và các thông tin khác. Nhấp vào 'Lưu thay đổi' sau khi hoàn tất.",
        },
        {
            question: "Tôi quên mật khẩu của mình. Làm thế nào để khôi phục nó?",
            answer:
                "Nếu bạn quên mật khẩu, nhấp vào liên kết 'Quên mật khẩu' trên trang đăng nhập. Nhập địa chỉ email đã đăng ký của bạn, và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.",
        },
    ],
    orders: [
        {
            question: "Làm thế nào để theo dõi đơn hàng của tôi?",
            answer:
                "Để theo dõi đơn hàng, đăng nhập vào tài khoản của bạn và truy cập phần 'Đơn hàng của tôi'. Chọn đơn hàng bạn muốn theo dõi và nhấp vào 'Theo dõi'. Bạn sẽ thấy trạng thái hiện tại và vị trí của đơn hàng.",
        },
        {
            question: "Làm thế nào để hủy đơn hàng?",
            answer:
                "Để hủy đơn hàng, truy cập phần 'Đơn hàng của tôi', tìm đơn hàng bạn muốn hủy và nhấp vào 'Hủy đơn hàng'. Lưu ý rằng bạn chỉ có thể hủy đơn hàng nếu nó chưa được xử lý hoặc vận chuyển.",
        },
        {
            question: "Tôi có thể thay đổi địa chỉ giao hàng sau khi đặt hàng không?",
            answer:
                "Có, bạn có thể thay đổi địa chỉ giao hàng nếu đơn hàng chưa được xử lý. Truy cập 'Đơn hàng của tôi', chọn đơn hàng và nhấp vào 'Thay đổi địa chỉ'. Nếu đơn hàng đã được xử lý, vui lòng liên hệ với dịch vụ khách hàng để được hỗ trợ.",
        },
        {
            question: "Tôi không nhận được email xác nhận đơn hàng. Tôi nên làm gì?",
            answer:
                "Nếu bạn không nhận được email xác nhận, đầu tiên hãy kiểm tra thư mục spam hoặc thư rác. Nếu vẫn không tìm thấy, đăng nhập vào tài khoản của bạn để xác minh rằng đơn hàng đã được đặt thành công. Nếu bạn thấy đơn hàng trong tài khoản nhưng không nhận được email, vui lòng liên hệ với dịch vụ khách hàng.",
        },
    ],
    payment: [
        {
            question: "Những phương thức thanh toán nào được chấp nhận?",
            answer:
                "Chúng tôi chấp nhận nhiều phương thức thanh toán, bao gồm thẻ tín dụng/ghi nợ (Visa, MasterCard, American Express), PayPal, chuyển khoản ngân hàng, và thanh toán khi nhận hàng (COD) cho một số khu vực.",
        },
        {
            question: "Làm thế nào để thêm hoặc thay đổi phương thức thanh toán?",
            answer:
                "Để thêm hoặc thay đổi phương thức thanh toán, đăng nhập vào tài khoản của bạn và truy cập 'Phương thức thanh toán' trong phần 'Cài đặt tài khoản'. Tại đây, bạn có thể thêm phương thức thanh toán mới hoặc chỉnh sửa phương thức hiện có.",
        },
        {
            question: "Khi nào tôi sẽ bị tính phí cho đơn hàng của mình?",
            answer:
                "Bạn sẽ bị tính phí ngay sau khi hoàn tất đơn hàng. Đối với các đơn đặt hàng trước hoặc sản phẩm tùy chỉnh, một khoản đặt cọc có thể được yêu cầu tại thời điểm đặt hàng, với số tiền còn lại được tính trước khi vận chuyển.",
        },
        {
            question: "Tôi có thể nhận hóa đơn cho đơn hàng của mình không?",
            answer:
                "Có, bạn có thể nhận hóa đơn cho đơn hàng của mình. Hóa đơn điện tử sẽ được gửi đến địa chỉ email đã đăng ký của bạn sau khi đơn hàng được xác nhận. Bạn cũng có thể tải xuống hóa đơn từ phần 'Đơn hàng của tôi' trong tài khoản của bạn.",
        },
    ],
    returns: [
        {
            question: "Chính sách hoàn trả của bạn là gì?",
            answer:
                "Chúng tôi chấp nhận hoàn trả trong vòng 30 ngày kể từ ngày giao hàng. Sản phẩm phải ở trong tình trạng mới, chưa sử dụng, với tất cả các thẻ và bao bì gốc. Một số mặt hàng, như đồ lót hoặc sản phẩm tùy chỉnh, không đủ điều kiện để hoàn trả.",
        },
        {
            question: "Làm thế nào để bắt đầu hoàn trả?",
            answer:
                "Để bắt đầu hoàn trả, đăng nhập vào tài khoản của bạn, truy cập 'Đơn hàng của tôi', và chọn đơn hàng có sản phẩm bạn muốn hoàn trả. Nhấp vào 'Bắt đầu hoàn trả' và làm theo hướng dẫn để hoàn thành quy trình.",
        },
        {
            question: "Khi nào tôi sẽ nhận được tiền hoàn lại?",
            answer:
                "Sau khi chúng tôi nhận được và xử lý sản phẩm hoàn trả của bạn, tiền hoàn lại sẽ được xử lý trong vòng 5-10 ngày làm việc. Thời gian để tiền xuất hiện trong tài khoản của bạn phụ thuộc vào phương thức thanh toán và ngân hàng của bạn.",
        },
        {
            question: "Tôi có thể đổi sản phẩm thay vì hoàn trả không?",
            answer:
                "Có, bạn có thể đổi sản phẩm nếu bạn muốn một kích thước, màu sắc hoặc kiểu dáng khác. Bắt đầu quy trình hoàn trả như bình thường, nhưng chọn 'Đổi sản phẩm' thay vì 'Hoàn trả'. Lưu ý rằng sản phẩm thay thế phải có sẵn trong kho.",
        },
    ],
}

export default function HelpPageContent() {
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState<keyof FAQData | "all">("all")

    // Filter questions based on search query
    const filterQuestions = (): Partial<FAQData> => {
        const filteredData: Partial<FAQData> = {}

        if (!searchQuery.trim()) {
            if (activeTab === "all") {
                return faqData
            } else {
                return { [activeTab]: faqData[activeTab] }
            }
        }


        const query = searchQuery.toLowerCase()

        Object.keys(faqData).forEach((category) => {
            if (activeTab === "all" || activeTab === category) {
                const filteredQuestions = faqData[category as keyof FAQData].filter(
                    (item) => item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query),
                )

                if (filteredQuestions.length > 0) {
                    filteredData[category as keyof FAQData] = filteredQuestions
                }
            }
        })

        return filteredData
    }

    const filteredData = filterQuestions()
    const categories: Record<keyof FAQData | "all", string> = {
        all: "Tất cả",
        account: "Tài khoản",
        orders: "Đơn hàng",
        payment: "Thanh toán",
        returns: "Hoàn trả",
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Trung tâm trợ giúp</h1>

                {/* Search bar */}
                <div className="relative mb-8">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm câu hỏi..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Category tabs */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as keyof FAQData | "all")} className="mb-8">
                    <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 mb-4">
                        {Object.entries(categories).map(([key, label]) => (
                            <TabsTrigger key={key} value={key} className="text-sm">
                                {label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* FAQ content */}
                    <TabsContent value={activeTab} className="mt-0">
                        {Object.keys(filteredData).length > 0 ? (
                            Object.entries(filteredData).map(([category, questions]) => (
                                <Card key={category} className="mb-6">
                                    <CardHeader>
                                        <CardTitle>{categories[category as keyof typeof categories]}</CardTitle>
                                        <CardDescription>
                                            Các câu hỏi thường gặp về {categories[category as keyof typeof categories].toLowerCase()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Accordion type="single" collapsible className="w-full">
                                            {questions.map((item, index) => (
                                                <AccordionItem key={index} value={`${category}-${index}`}>
                                                    <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                                                    <AccordionContent>
                                                        <p className="text-muted-foreground">{item.answer}</p>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <h3 className="text-xl font-medium mb-2">Không tìm thấy kết quả</h3>
                                <p className="text-muted-foreground mb-4">Không tìm thấy câu hỏi nào phù hợp với tìm kiếm của bạn.</p>
                                <Button onClick={() => setSearchQuery("")}>Xóa tìm kiếm</Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Contact section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Vẫn cần trợ giúp?</CardTitle>
                        <CardDescription>
                            Nếu bạn không tìm thấy câu trả lời cho câu hỏi của mình, hãy liên hệ với đội ngũ hỗ trợ của chúng tôi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-4">
                        <Button className="flex-1">Gửi tin nhắn</Button>
                        <Button variant="outline" className="flex-1">
                            Gọi điện thoại
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
