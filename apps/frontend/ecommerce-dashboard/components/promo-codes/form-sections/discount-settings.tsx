// components/promo-code/form-sections/discount-settings-section.tsx
"use client";


import { FormSection } from '@/components/ui/form-section';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CurrencyInput } from '@/components/ui/currency-input';
import { FormSingleSelect } from '@/components/ui/select/form-single-select';
import { EPromoCodeType } from '@/types/promo-code';

interface DiscountSettingsSectionProps {
    form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    isDetail?: boolean;
}

export function DiscountSettingsSection({ form, isDetail = false }: DiscountSettingsSectionProps) {
    const promoCodeType = form.watch('type');

    const PromoCodeTypeOptions = [
        { label: 'Giảm theo %', value: EPromoCodeType.PercentageDiscount },
        { label: 'Giảm số tiền cố định', value: EPromoCodeType.FixedAmountDiscount },
        { label: 'Miễn phí vận chuyển', value: EPromoCodeType.FreeShipping },
        { label: 'Khuyến mại hỗn hợp', value: EPromoCodeType.Mixed },
    ];

    const renderDiscountFields = () => {
        switch (promoCodeType) {
            case EPromoCodeType.PercentageDiscount:
                return (
                    <FormField
                        control={form.control}
                        name="discountPercentage"
                        disabled={isDetail}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phần trăm giảm giá (%)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        placeholder="Nhập phần trăm giảm giá"
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                );

            case EPromoCodeType.FixedAmountDiscount:
                return (
                    <FormField
                        control={form.control}
                        name="discountAmount"
                        disabled={isDetail}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Số tiền giảm giá (VNĐ)</FormLabel>
                                <FormControl>
                                    <CurrencyInput
                                        placeholder="Nhập số tiền giảm giá"
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                        disabled={isDetail}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                );

            case EPromoCodeType.FreeShipping:
                return (
                    <FormField
                        control={form.control}
                        name="freeShipping"
                        disabled={isDetail}
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Miễn phí vận chuyển</FormLabel>
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
                );

            default:
                return null;
        }
    };

    return (
        <FormSection title="Cài đặt giảm giá">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSingleSelect
                    name="type"
                    label="Loại giảm giá *"
                    placeholder="Chọn loại giảm giá"
                    options={PromoCodeTypeOptions || []}
                    disabled={isDetail}
                />

                {renderDiscountFields()}
            </div>
        </FormSection>
    );
}