"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateAddressDto } from "@/types/address";
import { useRouter } from "next/navigation";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

const addressFormSchema = z.object({
    addressType: z.string().min(1, "Vui lòng chọn loại địa chỉ"),
    fullName: z.string().min(2, "Tên quá ngắn"),
    phone: z.string().min(10, "Số điện thoại không hợp lệ"),
    street: z.string().min(5, "Địa chỉ quá ngắn"),
    city: z.string().min(2, "Vui lòng nhập thành phố"),
    state: z.string().min(2, "Vui lòng nhập tỉnh/thành phố"),
    postalCode: z.string().min(3, "Vui lòng nhập mã bưu điện"),
    country: z.string().min(2, "Vui lòng chọn quốc gia"),
    isDefault: z.boolean().default(false),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

interface AddressFormProps {
    onSubmit: (data: CreateAddressDto) => void;
    isSubmitting?: boolean;
    initialValues?: Partial<CreateAddressDto>;
}

export function AddressForm({
    onSubmit,
    isSubmitting = false,
    initialValues
}: AddressFormProps) {
    const router = useRouter();

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressFormSchema),
        defaultValues: {
            addressType: "home",
            fullName: "",
            phone: "",
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "VN",
            isDefault: false,
            ...initialValues,
        },
    });

    function handleSubmit(data: AddressFormValues) {
        onSubmit(data);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="addressType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Loại địa chỉ</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn loại địa chỉ" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="home">Nhà riêng</SelectItem>
                                        <SelectItem value="office">Văn phòng</SelectItem>
                                        <SelectItem value="other">Khác</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Họ và tên</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nguyễn Văn A" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Số điện thoại</FormLabel>
                                <FormControl>
                                    <Input placeholder="0987654321" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Địa chỉ</FormLabel>
                                <FormControl>
                                    <Input placeholder="Số nhà, đường, phố" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Thành phố/Quận</FormLabel>
                                <FormControl>
                                    <Input placeholder="Hà Nội" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tỉnh/Thành phố</FormLabel>
                                <FormControl>
                                    <Input placeholder="Hà Nội" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mã bưu điện</FormLabel>
                                <FormControl>
                                    <Input placeholder="100000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quốc gia</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn quốc gia" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="VN">Việt Nam</SelectItem>
                                        <SelectItem value="US">Hoa Kỳ</SelectItem>
                                        <SelectItem value="UK">Vương quốc Anh</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Đặt làm địa chỉ mặc định</FormLabel>
                            </div>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Hủy bỏ
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Lưu địa chỉ
                    </Button>
                </div>
            </form>
        </Form>
    );
}