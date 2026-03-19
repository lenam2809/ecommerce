"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

export default function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        toast({
            title: "Yêu cầu đã được gửi",
            description: "Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.",
        })

        // Reset form
        e.currentTarget.reset()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input id="name" required placeholder="Nguyễn Văn A" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required placeholder="example@email.com" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="subject">Chủ đề</Label>
                <Select required>
                    <SelectTrigger id="subject">
                        <SelectValue placeholder="Chọn chủ đề" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="account">Vấn đề về tài khoản</SelectItem>
                        <SelectItem value="order">Vấn đề về đơn hàng</SelectItem>
                        <SelectItem value="payment">Vấn đề về thanh toán</SelectItem>
                        <SelectItem value="return">Vấn đề về hoàn trả</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Nội dung</Label>
                <Textarea id="message" required placeholder="Mô tả chi tiết vấn đề của bạn..." rows={5} />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu hỗ trợ"}
            </Button>
        </form>
    )
}
