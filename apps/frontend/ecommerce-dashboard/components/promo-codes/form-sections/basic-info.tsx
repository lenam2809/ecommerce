// components/promo-code/form-sections/basic-info-section.tsx
"use client";


import { FormSection } from '@/components/ui/form-section';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';


interface BasicInfoSectionProps {
    form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    isDetail?: boolean;
}

export function BasicInfoSection({ form, isDetail = false }: BasicInfoSectionProps) {
    return (
        <FormSection title="Thông tin cơ bản">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="code"
                    disabled={isDetail}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mã khuyến mãi</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Nhập mã khuyến mãi"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isActive"
                    disabled={isDetail}
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Kích hoạt</FormLabel>
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
                    name="description"
                    disabled={isDetail}
                    render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel>Mô tả</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Nhập mô tả mã khuyến mãi"
                                    className="min-h-[100px]"
                                    {...field}
                                    value={field.value ?? ''}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </FormSection>
    );
}