"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Showroom } from "@/types/showroom";
import { showroomFormSchema, ShowroomFormValues } from "@/schemas/showroom";
import { useCreateShowroom, useUpdateShowroom } from "@/hooks/use-showrooms";
import { Loader2 } from "lucide-react";

interface ShowroomFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    showroom?: Showroom | null;
}

const REGIONS = [
    { value: "HCM", label: "TP. Hồ Chí Minh (HCM)" },
    { value: "HN", label: "Hà Nội (HN)" },
    { value: "DN", label: "Đà Nẵng (DN)" },
    { value: "CT", label: "Cần Thơ (CT)" },
    { value: "Other", label: "Tỉnh thành khác (Other)" },
];

export function ShowroomFormDialog({
    open,
    onOpenChange,
    showroom,
}: ShowroomFormDialogProps) {
    const isEdit = Boolean(showroom?.id);

    const form = useForm<any>({
        resolver: zodResolver(showroomFormSchema),
        defaultValues: {
            code: "",
            name: "",
            region: "HCM",
            city: "",
            province: "",
            district: "",
            ward: "",
            address: "",
            phone: "1800 6868",
            openingHours: "08:00 - 21:30",
            latitude: null,
            longitude: null,
            googleMapIframeUrl: "",
            isFlagship: false,
            hasInstantPickup: true,
            isActive: true,
            displayOrder: 0,
        },
    });

    useEffect(() => {
        if (showroom) {
            form.reset({
                id: showroom.id,
                code: showroom.code,
                name: showroom.name,
                region: showroom.region || "HCM",
                city: showroom.city,
                province: showroom.province || showroom.city,
                district: showroom.district,
                ward: showroom.ward || "",
                address: showroom.address,
                phone: showroom.phone || "1800 6868",
                openingHours: showroom.openingHours || "08:00 - 21:30",
                latitude: showroom.latitude ?? null,
                longitude: showroom.longitude ?? null,
                googleMapIframeUrl: showroom.googleMapIframeUrl || "",
                isFlagship: showroom.isFlagship,
                hasInstantPickup: showroom.hasInstantPickup,
                isActive: showroom.isActive,
                displayOrder: showroom.displayOrder ?? 0,
            });
        } else {
            form.reset({
                code: "",
                name: "",
                region: "HCM",
                city: "",
                province: "",
                district: "",
                ward: "",
                address: "",
                phone: "1800 6868",
                openingHours: "08:00 - 21:30",
                latitude: null,
                longitude: null,
                googleMapIframeUrl: "",
                isFlagship: false,
                hasInstantPickup: true,
                isActive: true,
                displayOrder: 0,
            });
        }
    }, [showroom, form, open]);

    const createMutation = useCreateShowroom(() => onOpenChange(false));
    const updateMutation = useUpdateShowroom(() => onOpenChange(false));

    const isPending = createMutation.isPending || updateMutation.isPending;

    const onSubmit = (values: any) => {
        const payload = {
            ...values,
            latitude: values.latitude ?? undefined,
            longitude: values.longitude ?? undefined,
            city: values.city,
            province: values.province || values.city,
        };

        if (isEdit && showroom?.id) {
            updateMutation.mutate({
                ...payload,
                id: showroom.id,
            });
        } else {
            createMutation.mutate(payload);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        {isEdit ? "Chỉnh sửa cơ sở Showroom" : "Thêm mới cơ sở Showroom"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Cập nhật thông tin điểm bán, định vị và cấu hình tiếp nhận O2O."
                            : "Khai báo điểm bán mới thuộc hệ thống 45 Showroom công nghệ toàn quốc."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mã Showroom *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: SR-HCM-01, SR-HN-02" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="region"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Khu vực (Region) *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn khu vực" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {REGIONS.map((r) => (
                                                    <SelectItem key={r.value} value={r.value}>
                                                        {r.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên Showroom *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="VD: Showroom Flagship Quận 1 - Lê Lợi"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tỉnh / Thành phố *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: TP. Hồ Chí Minh" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="district"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quận / Huyện *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: Quận 1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ward"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phường / Xã</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="VD: Phường Bến Nghé"
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Địa chỉ chi tiết *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="VD: 123 Lê Lợi, Phường Bến Nghé, Quận 1"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hotline CSKH / Bán hàng *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="1800 6868" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Chuẩn SSoT: 1800 6868 (Bán hàng) / 1800 6869 (Kỹ thuật)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="openingHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Giờ mở cửa *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="08:00 - 21:30" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Chuẩn SSoT: 08:00 - 21:30 (Cả CN & Lễ)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="latitude"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vĩ độ (Latitude)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="any"
                                                placeholder="VD: 10.77123"
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="longitude"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kinh độ (Longitude)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="any"
                                                placeholder="VD: 106.69874"
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="displayOrder"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thứ tự hiển thị</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                value={field.value ?? 0}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="googleMapIframeUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Đường dẫn nhúng Google Maps (Tùy chọn)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://maps.google.com/..."
                                            value={field.value ?? ""}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Feature toggles */}
                        <div className="rounded-lg border border-border p-4 space-y-4 bg-muted/20">
                            <FormField
                                control={form.control}
                                name="isFlagship"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel className="font-medium">
                                                Cơ sở Flagship (Trọng điểm O2O)
                                            </FormLabel>
                                            <FormDescription className="text-xs">
                                                Được gắn huy hiệu Tech Crimson và ưu tiên điều phối hàng hóa
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="hasInstantPickup"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel className="font-medium">
                                                Hỗ trợ nhận máy 15 phút (Instant Pickup)
                                            </FormLabel>
                                            <FormDescription className="text-xs">
                                                Cho phép khách đặt online nhận tại cửa hàng trong 15 phút
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel className="font-medium">
                                                Trạng thái hoạt động
                                            </FormLabel>
                                            <FormDescription className="text-xs">
                                                Bật để cơ sở hiển thị cho khách đặt hàng & chọn điểm nhận
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-2">
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
                                disabled={isPending}
                                className="bg-brand hover:bg-brand/90 text-white font-medium"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin mr-2" />
                                        Đang lưu...
                                    </>
                                ) : isEdit ? (
                                    "Lưu thay đổi"
                                ) : (
                                    "Thêm Showroom"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
