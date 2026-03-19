"use client"

import { useState } from "react"
import { useGetAboutSections, useUpdateAboutStatus } from "@/hooks/use-about"
import { AboutForm } from "@/components/about/about-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Building2, Users, Target, History, Megaphone } from "lucide-react"
import { StatusToggle } from "@/components/ui/status/status-toggle"
import type { AboutDto } from "@/types/about"

export default function AboutManagementPage() {
    const [selectedSection, setSelectedSection] = useState<AboutDto | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const { data: aboutSectionsResult, isLoading, error } = useGetAboutSections()
    const aboutSections = aboutSectionsResult?.data || []
    const updateStatusMutation = useUpdateAboutStatus()

    const handleCreateNew = () => {
        setSelectedSection(null)
        setIsCreating(true)
    }

    const handleEditSection = (section: AboutDto) => {
        setSelectedSection(section)
        setIsCreating(false)
    }

    const handleBackToList = () => {
        setSelectedSection(null)
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
                    {[...Array(2)].map((_, i) => (
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

    if (isCreating || selectedSection) {
        return (
            <div className="container mx-auto p-6">
                <AboutForm initialData={selectedSection} onCancel={handleBackToList} isEditing={!!selectedSection} />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý thông tin About</h1>
                    <p className="text-muted-foreground">Quản lý thông tin về doanh nghiệp, sứ mệnh và giá trị cốt lõi</p>
                </div>
                <Button onClick={handleCreateNew} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tạo mới
                </Button>
            </div>

            {aboutSections && aboutSections.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    {aboutSections.map((section: AboutDto) => (
                        <Card key={section.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        {section.hero.title}
                                    </CardTitle>
                                    <StatusToggle
                                        id={section.id!}
                                        isActive={section.isActive ?? true}
                                        onToggle={handleStatusToggle}
                                        isLoading={updateStatusMutation.isPending}
                                        type="about"
                                    />
                                </div>
                                <CardDescription className="line-clamp-2">{section.hero.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="overview" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="overview" className="text-xs">
                                            <Target className="h-3 w-3" />
                                        </TabsTrigger>
                                        <TabsTrigger value="values" className="text-xs">
                                            <Users className="h-3 w-3" />
                                        </TabsTrigger>
                                        <TabsTrigger value="history" className="text-xs">
                                            <History className="h-3 w-3" />
                                        </TabsTrigger>
                                        <TabsTrigger value="cta" className="text-xs">
                                            <Megaphone className="h-3 w-3" />
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="overview" className="mt-4">
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">Giá trị cốt lõi: {section.values.length} mục</p>
                                            <p className="text-sm text-muted-foreground">Thành viên: {section.team.length} người</p>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="values" className="mt-4">
                                        <div className="space-y-1">
                                            {section.values.slice(0, 2).map((value, index) => (
                                                <p key={index} className="text-xs text-muted-foreground line-clamp-1">
                                                    • {value.title}
                                                </p>
                                            ))}
                                            {section.values.length > 2 && (
                                                <p className="text-xs text-muted-foreground">+{section.values.length - 2} mục khác</p>
                                            )}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="history" className="mt-4">
                                        <p className="text-xs text-muted-foreground line-clamp-3">{section.history.title}</p>
                                    </TabsContent>
                                    <TabsContent value="cta" className="mt-4">
                                        <p className="text-xs text-muted-foreground line-clamp-2">{section.cta.title}</p>
                                    </TabsContent>
                                </Tabs>
                                <Button onClick={() => handleEditSection(section)} className="w-full mt-4" variant="outline">
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
                            <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
                            <div>
                                <h3 className="text-lg font-semibold">Chưa có thông tin About</h3>
                                <p className="text-muted-foreground">
                                    Tạo thông tin About đầu tiên để giới thiệu về doanh nghiệp của bạn
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
