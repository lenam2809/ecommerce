"use client"

import { useState } from "react"
import { useGetContacts, useUpdateContactStatus } from "@/hooks/use-contact"
import { ContactForm } from "@/components/contact/contact-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Phone, Mail, MapPin, MessageSquare, ExternalLink } from "lucide-react"
import type { ContactDto } from "@/types/contact"
import { StatusToggle } from "@/components/ui/status/status-toggle"

export default function ContactManagementPage() {
    const [selectedContact, setSelectedContact] = useState<ContactDto | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const { data: contactsResult, isLoading, error } = useGetContacts()
    const contacts = contactsResult?.data || []
    const updateStatusMutation = useUpdateContactStatus()

    const handleCreateNew = () => {
        setSelectedContact(null)
        setIsCreating(true)
    }

    const handleEditContact = (contact: ContactDto) => {
        setSelectedContact(contact)
        setIsCreating(false)
    }

    const handleBackToList = () => {
        setSelectedContact(null)
        setIsCreating(false)
    }

    const handleStatusToggle = (id: string, isActive: boolean) => {
        updateStatusMutation.mutate({ id, isActive })
    }

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-red-600">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.</div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (isCreating || selectedContact) {
        return (
            <div className="container mx-auto p-6">
                <ContactForm initialData={selectedContact} onCancel={handleBackToList} isEditing={!!selectedContact} />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý thông tin liên hệ</h1>
                    <p className="text-muted-foreground">Quản lý thông tin liên hệ, mạng xã hội và câu hỏi thường gặp</p>
                </div>
                <Button onClick={handleCreateNew} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tạo mới
                </Button>
            </div>

            {contacts && contacts.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    {contacts.map((contact: ContactDto) => (
                        <Card key={contact.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Phone className="h-5 w-5" />
                                        Thông tin liên hệ
                                    </CardTitle>
                                    <StatusToggle
                                        id={contact.id!}
                                        isActive={contact.isActive ?? true}
                                        onToggle={handleStatusToggle}
                                        isLoading={updateStatusMutation.isPending}
                                        type="contact"
                                    />
                                </div>
                                <CardDescription>Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{contact.phone.numberOrAddress}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{contact.email.numberOrAddress}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium line-clamp-1">{contact.office.numberOrAddress}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Mạng xã hội: {contact.social.length}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">FAQ: {contact.faqs.length}</span>
                                    </div>
                                </div>

                                <Button onClick={() => handleEditContact(contact)} className="w-full" variant="outline">
                                    Chỉnh sửa
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <Phone className="h-12 w-12 mx-auto text-muted-foreground" />
                            <div>
                                <h3 className="text-lg font-semibold">Chưa có thông tin liên hệ</h3>
                                <p className="text-muted-foreground">
                                    Tạo thông tin liên hệ đầu tiên để khách hàng có thể liên hệ với bạn
                                </p>
                            </div>
                            <Button onClick={handleCreateNew} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Tạo mới
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
