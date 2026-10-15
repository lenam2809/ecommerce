"use client"

import { Loader2, Edit2, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { User } from "@/types/user"
import { formUpdateUserSchema, FormUpdateUserSchema } from "@/schemas/user-schema"
import { useEffect, useState } from "react"

export function ProfileTab({ userData, isLoadingUser, isUpdatingUser, handleSubmit }: {
    userData: User
    isLoadingUser: boolean
    isUpdatingUser: boolean
    handleSubmit: (data: FormUpdateUserSchema) => Promise<void>
}) {
    const [isEditing, setIsEditing] = useState(false)
    
    const form = useForm<FormUpdateUserSchema>({
        resolver: zodResolver(formUpdateUserSchema),
        defaultValues: {
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            phoneNumber: userData.phoneNumber || "",
            avatar: undefined,
        },
    })

    useEffect(() => {
        if (!isLoadingUser && userData) {
            form.reset({
                id: userData.id || "",
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                phoneNumber: userData.phoneNumber || "",
                avatar: undefined,
            })
        }
    }, [isLoadingUser, userData, form])

    const onSubmit = async (data: FormUpdateUserSchema) => {
        await handleSubmit(data)
        setIsEditing(false)
    }

    if (isLoadingUser) {
        return (
            <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-card">
            {/* Tab header */}
            <div className="p-6 bg-surface border-b border-line flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-h3 font-semibold text-ink">Hồ sơ của tôi</h3>
                    <p className="text-small text-ink-soft mt-1">Quản lý các thông tin cơ bản về bạn.</p>
                </div>
                <Button
                    variant={isEditing ? "outline" : "default"}
                    className="rounded-full h-10 px-6 text-small font-medium transition-colors"
                    onClick={() => {
                        if (isEditing) form.reset() // Reset form to default values when cancelling
                        setIsEditing(!isEditing)
                    }}
                >
                    {isEditing ? (
                        <>Hủy bỏ</>
                    ) : (
                        <>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                        </>
                    )}
                </Button>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
                {!isEditing ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Summary Block */}
                        <div className="flex items-center gap-6 pb-8 border-b border-line">
                            <div className="h-24 w-24 rounded-full border border-line overflow-hidden relative">
                                <Image
                                    src={userData.avatar || "/placeholder.svg"}
                                    alt={userData.email}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-h3 font-semibold text-ink">{userData.firstName} {userData.lastName}</h3>
                                <p className="text-ink-soft text-small flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Standard Account
                                </p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-small font-medium text-ink-faint mb-1">Họ và tên</p>
                                <p className="text-body text-ink font-medium bg-surface px-4 py-2.5 rounded-xl border border-line">
                                    {userData.firstName} {userData.lastName}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-small font-medium text-ink-faint mb-1">Email</p>
                                <p className="text-body text-ink font-medium bg-surface px-4 py-2.5 rounded-xl border border-line">
                                    {userData.email}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-small font-medium text-ink-faint mb-1">Số điện thoại</p>
                                <p className="text-body text-ink font-medium bg-surface px-4 py-2.5 rounded-xl border border-line">
                                    {userData.phoneNumber || "Chưa cập nhật"}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-tiny font-semibold text-ink-soft">Tên</FormLabel>
                                                <FormControl>
                                                    <Input className="h-11 rounded-full border-line bg-surface-2/40 px-4 text-small text-ink focus-visible:ring-brand/20 focus-visible:border-brand transition-colors" placeholder="Nhập tên" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-tiny font-semibold text-ink-soft">Họ</FormLabel>
                                                <FormControl>
                                                    <Input className="h-11 rounded-full border-line bg-surface-2/40 px-4 text-small text-ink focus-visible:ring-brand/20 focus-visible:border-brand transition-colors" placeholder="Nhập họ" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormItem>
                                        <FormLabel className="text-tiny font-semibold text-ink-soft">Email (Cố định)</FormLabel>
                                        <FormControl>
                                            <Input className="h-11 rounded-full border-line bg-surface-2/70 px-4 text-small text-ink-faint cursor-not-allowed" value={userData.email} disabled />
                                        </FormControl>
                                    </FormItem>

                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-tiny font-semibold text-ink-soft">Số điện thoại</FormLabel>
                                                <FormControl>
                                                    <Input className="h-11 rounded-full border-line bg-surface-2/40 px-4 text-small text-ink focus-visible:ring-brand/20 focus-visible:border-brand transition-colors" placeholder="Nhập số điện thoại" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="avatar"
                                        render={({ field }) => {
                                            const previewUrl = field.value
                                                ? typeof field.value === 'string'
                                                    ? field.value
                                                    : URL.createObjectURL(field.value)
                                                : userData.avatar || "/placeholder.svg"

                                            return (
                                                <FormItem className="col-span-1 md:col-span-2 mt-4">
                                                    <FormLabel className="text-ink-soft">Ảnh đại diện</FormLabel>
                                                    <div className="flex items-center gap-6 p-4 rounded-2xl border border-dashed border-line bg-surface">
                                                        <div className="relative">
                                                            <div className="h-24 w-24 rounded-full overflow-hidden border border-line">
                                                                <Image
                                                                    src={previewUrl}
                                                                    alt={userData.fullName || "Avatar"}
                                                                    fill
                                                                    className="object-cover"
                                                                    onLoad={() => {
                                                                        if (field.value && typeof field.value !== 'string') {
                                                                            URL.revokeObjectURL(previewUrl)
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                            {field.value && (
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full shadow-md"
                                                                    onClick={() => field.onChange(undefined)}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col gap-3">
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    asChild
                                                                    className="w-fit rounded-full border-line text-ink font-medium"
                                                                >
                                                                    <label className="cursor-pointer">
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            className="hidden"
                                                                            onChange={(e) => {
                                                                                if (e.target.files?.[0]) {
                                                                                    field.onChange(e.target.files[0])
                                                                                }
                                                                            }}
                                                                        />
                                                                        {field.value ? 'Chọn ảnh khác' : 'Tải lên từ thiết bị'}
                                                                    </label>
                                                                </Button>
                                                                {field.value && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="w-fit text-destructive hover:text-destructive/80 rounded-full"
                                                                        onClick={() => field.onChange(undefined)}
                                                                    >
                                                                        Xóa
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <p className="text-tiny text-ink-faint flex items-center gap-1.5">
                                                                <AlertCircle className="h-3 w-3" />
                                                                Định dạng: JPG, PNG (Tối đa 2MB)
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )
                                        }}
                                    />
                                </div>

                                <div className="pt-4 border-t border-line flex justify-end">
                                    <Button
                                        type="submit"
                                        className="rounded-full px-8 h-11 text-small font-semibold bg-brand text-white hover:bg-brand-hover transition-colors"
                                        disabled={isUpdatingUser}
                                    >
                                        {isUpdatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Lưu thay đổi
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                )}
            </div>
        </div>
    )
}
