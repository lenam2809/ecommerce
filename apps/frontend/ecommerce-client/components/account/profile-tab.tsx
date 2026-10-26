"use client"

import { Loader2, Edit2, ShieldCheck, Mail, Phone, UserCheck, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "@/types/user"
import { formUpdateUserSchema, FormUpdateUserSchema } from "@/schemas/user-schema"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function ProfileTab({
    userData,
    isLoadingUser,
    isUpdatingUser,
    handleSubmit,
}: {
    userData: User
    isLoadingUser: boolean
    isUpdatingUser: boolean
    handleSubmit: (data: FormUpdateUserSchema) => Promise<void>
}) {
    const [isEditing, setIsEditing] = useState(false)

    const displayFirstName = userData.firstName || ""
    const displayLastName = userData.lastName || ""
    const displayFullName =
        userData.fullName || [displayLastName, displayFirstName].filter(Boolean).join(" ") || userData.email || "Thành viên"
    const displayEmail = userData.email || "—"
    const displayPhone = userData.phoneNumber || "—"
    const avatarInitials = (displayFullName || "U")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("") || "SV"

    const form = useForm<FormUpdateUserSchema>({
        resolver: zodResolver(formUpdateUserSchema),
        defaultValues: {
            firstName: displayFirstName,
            lastName: displayLastName,
            phoneNumber: displayPhone !== "—" ? displayPhone : "",
            avatar: undefined,
        },
    })

    useEffect(() => {
        form.reset({
            id: userData.id || "",
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            phoneNumber: userData.phoneNumber || "",
            avatar: undefined,
        })
    }, [userData, form])

    const onSubmit = async (data: FormUpdateUserSchema) => {
        try {
            await handleSubmit(data)
            toast.success("Đã cập nhật hồ sơ cá nhân thành công!")
            setIsEditing(false)
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string }
            toast.error(err?.response?.data?.message || err?.message || "Cập nhật hồ sơ thất bại, vui lòng thử lại.")
        }
    }

    return (
        <div className="flex flex-col bg-card rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="text-xs font-extrabold uppercase tracking-widest text-primary mb-1">
                        Hồ sơ cá nhân (View-Only)
                    </p>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        Thông tin định danh thành viên
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Thông tin dùng để kích hoạt Bảo hành Điện tử Chính hãng (Apple VN/A, Samsung, Sony)
                    </p>
                </div>
                <Button
                    type="button"
                    variant={isEditing ? "outline" : "default"}
                    className={`rounded-xl h-10 px-5 text-xs font-bold transition-colors cursor-pointer ${
                        isEditing
                            ? "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                            : "bg-primary text-white hover:bg-primary/90"
                    }`}
                    onClick={() => {
                        if (isEditing) form.reset()
                        setIsEditing(!isEditing)
                    }}
                >
                    {isEditing ? (
                        <>Hủy chỉnh sửa</>
                    ) : (
                        <>
                            <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                            Chỉnh sửa hồ sơ
                        </>
                    )}
                </Button>
            </div>

            {/* Content */}
            <div className="p-6">
                {!isEditing ? (
                    <div className="space-y-6">
                        {/* Top Identity Row with 64x64px "NA" Avatar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-tech-blue text-white font-extrabold text-xl flex items-center justify-center ring-2 ring-tech-blue/30 shadow-sm shrink-0 select-none">
                                    {avatarInitials}
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                                            {displayFullName}
                                        </h4>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                            Đã xác thực eKYC
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                        Mã thành viên: <strong className="text-slate-900 dark:text-white font-mono tabular-nums">{userData.id ? userData.id.slice(0, 8).toUpperCase() : "SV-MEMBER"}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* View-Only Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                                    <UserCheck className="h-3.5 w-3.5 text-primary" />
                                    Họ và tên đầy đủ
                                </span>
                                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                                    {displayFullName}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                                    <Mail className="h-3.5 w-3.5 text-primary" />
                                    Email nhận Hóa đơn điện tử VAT
                                </span>
                                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                                    {displayEmail}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                                    <Phone className="h-3.5 w-3.5 text-primary" />
                                    Số điện thoại Bảo hành Điện tử
                                </span>
                                <p className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                                    {displayPhone}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                    Chu kỳ xét hạng thẻ tiếp theo
                                </span>
                                <p className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                                    31/12/2026 (Hạng VIP Diamond)
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Họ &amp; Tên đệm
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                                                    placeholder="Nguyễn"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Tên
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                                                    placeholder="Minh Quân"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Email định danh (Cố định)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                            value={displayEmail}
                                            disabled
                                        />
                                    </FormControl>
                                </FormItem>

                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Số điện thoại liên hệ
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="tel"
                                                    inputMode="tel"
                                                    className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm tabular-nums"
                                                    placeholder="0909 686 868"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditing(false)}
                                    className="rounded-xl px-5 h-10 text-xs font-bold"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    className="rounded-xl px-6 h-10 text-xs font-bold bg-primary text-white hover:bg-primary/90 cursor-pointer"
                                    disabled={isUpdatingUser || isLoadingUser}
                                >
                                    {isUpdatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </div>
        </div>
    )
}
