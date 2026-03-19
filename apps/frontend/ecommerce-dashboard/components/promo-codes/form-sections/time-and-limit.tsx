// components/promo-code/form-sections/time-and-limit-section.tsx
"use client";

import { FormSection } from '@/components/ui/form-section';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/date-picker';
import { PromoCode } from '@/types/promo-code';

interface TimeAndLimitSectionProps {
    form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    promoCode?: PromoCode;
    isDetail?: boolean;
}

export function TimeAndLimitSection({ form, promoCode, isDetail = false }: TimeAndLimitSectionProps) {
    return (
        <FormSection title="Thời gian và giới hạn sử dụng">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker
                    form={form}
                    name="validFrom"
                    label="Thời gian bắt đầu"
                    placeholder="Chọn ngày"
                    dateFormat="dd/MM/yyyy"
                    clearable={true}
                    showTodayButton={true}
                    disabled={isDetail}
                />

                <DatePicker
                    form={form}
                    name="validTo"
                    label="Thời gian kết thúc"
                    placeholder="Chọn ngày"
                    dateFormat="dd/MM/yyyy"
                    clearable={true}
                    showTodayButton={true}
                    disabled={isDetail}
                />

                <FormField
                    control={form.control}
                    name="usageLimit"
                    disabled={isDetail}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Giới hạn sử dụng (0 = không giới hạn)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="Nhập giới hạn sử dụng"
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {promoCode && (
                    <div className="flex items-center p-4 border rounded-lg">
                        <span className="text-sm text-muted-foreground">
                            Đã sử dụng: {promoCode.timesUsed} lần
                        </span>
                    </div>
                )}
            </div>
        </FormSection>
    );
}