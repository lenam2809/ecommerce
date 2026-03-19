"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ELockType, LockUserRequest } from "@/types/account-lock"
import { useLockUser } from "@/hooks/use-account-lock"
import { Lock, Clock, Ban } from "lucide-react"
import { User } from "@/types/user"

const lockUserSchema = z.object({
    reason: z.string().min(1, "Lý do khóa tài khoản là bắt buộc").max(500, "Lý do không được vượt quá 500 ký tự"),
    lockType: z.nativeEnum(ELockType, { required_error: "Vui lòng chọn loại khóa" }),
    durationMinutes: z.number().optional(),
    notes: z.string().max(1000, "Ghi chú không được vượt quá 1000 ký tự").optional(),
}).refine((data) => {
    if (data.lockType === ELockType.Temporary && (!data.durationMinutes || data.durationMinutes <= 0)) {
        return false;
    }
    return true;
}, {
    message: "Thời gian khóa là bắt buộc đối với khóa tạm thời",
    path: ["durationMinutes"],
});

type LockUserFormData = z.infer<typeof lockUserSchema>



interface LockUserDialogProps {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const COMMON_REASONS = [
    "Vi phạm điều khoản sử dụng",
    "Spam hoặc gửi nội dung không phù hợp",
    "Hoạt động đáng ngờ",
    "Yêu cầu từ người dùng",
    "Vi phạm quy định bảo mật",
    "Tài khoản giả mạo",
    "Lạm dụng hệ thống",
    "Khác"
];

const DURATION_PRESETS = [
    { label: "15 phút", value: 15 },
    { label: "30 phút", value: 30 },
    { label: "1 giờ", value: 60 },
    { label: "6 giờ", value: 360 },
    { label: "12 giờ", value: 720 },
    { label: "1 ngày", value: 1440 },
    { label: "3 ngày", value: 4320 },
    { label: "7 ngày", value: 10080 },
    { label: "30 ngày", value: 43200 },
];

export function LockUserDialog({ user, open, onOpenChange, onSuccess }: LockUserDialogProps) {
    const { mutate: lockUser, isPending } = useLockUser()
    const [selectedReason, setSelectedReason] = useState<string>("")

    const form = useForm<LockUserFormData>({
        resolver: zodResolver(lockUserSchema),
        defaultValues: {
            reason: "",
            lockType: ELockType.Temporary,
            durationMinutes: 60,
            notes: "",
        },
    })

    const watchLockType = form.watch("lockType")

    const onSubmit = (data: LockUserFormData) => {
        if (!user) return;

        const request: LockUserRequest = {
            userId: user.id,
            reason: data.reason,
            lockType: data.lockType,
            notes: data.notes,
        };

        if (data.lockType === ELockType.Temporary && data.durationMinutes) {
            request.durationMinutes = data.durationMinutes;
        }

        lockUser(request, {
            onSuccess: () => {
                form.reset();
                setSelectedReason("");
                onOpenChange(false);
                onSuccess?.();
            }
        });
    };

    const handleReasonSelect = (reason: string) => {
        setSelectedReason(reason);
        if (reason !== "Khác") {
            form.setValue("reason", reason);
        } else {
            form.setValue("reason", "");
        }
    };

    const handleDurationPreset = (minutes: number) => {
        form.setValue("durationMinutes", minutes);
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-red-600" />
                        Khóa tài khoản người dùng
                    </DialogTitle>
                    <DialogDescription>
                        Khóa tài khoản sẽ ngăn người dùng truy cập vào hệ thống. Vui lòng cung cấp lý do rõ ràng.
                    </DialogDescription>
                </DialogHeader>

                {/* User Info */}
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Avatar className="h-10 w-10">
                        {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.fullName} />
                        ) : (
                            <AvatarFallback>{user.fullName?.charAt(0).toUpperCase()}</AvatarFallback>
                        )}
                    </Avatar>
                    <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Lock Type */}
                        <FormField
                            control={form.control}
                            name="lockType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Loại khóa</FormLabel>
                                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn loại khóa" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={ELockType.Temporary.toString()}>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span>Khóa tạm thời</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value={ELockType.Permanent.toString()}>
                                                <div className="flex items-center gap-2">
                                                    <Ban className="h-4 w-4" />
                                                    <span>Khóa vĩnh viễn</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Duration for Temporary Lock */}
                        {watchLockType === ELockType.Temporary && (
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="durationMinutes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Thời gian khóa</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Thời gian khóa tính bằng phút
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex flex-wrap gap-2">
                                    {DURATION_PRESETS.map((preset) => (
                                        <Badge
                                            key={preset.value}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-muted"
                                            onClick={() => handleDurationPreset(preset.value)}
                                        >
                                            {preset.label}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reason */}
                        <div className="space-y-4">
                            <FormLabel>Lý do khóa (chọn một trong các lý do phổ biến)</FormLabel>
                            <div className="flex flex-wrap gap-2">
                                {COMMON_REASONS.map((reason) => (
                                    <Badge
                                        key={reason}
                                        variant={selectedReason === reason ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => handleReasonSelect(reason)}
                                    >
                                        {reason}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lý do chi tiết</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Nhập lý do khóa tài khoản..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ghi chú (tùy chọn)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Thêm ghi chú nếu cần..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={isPending}
                            >
                                {isPending ? "Đang xử lý..." : "Xác nhận khóa"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}