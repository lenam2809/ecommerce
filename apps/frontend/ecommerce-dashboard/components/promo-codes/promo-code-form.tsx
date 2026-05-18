// components/promo-code/promo-code-form.tsx
"use client";

import { logger } from '@/lib/logger'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { CreatePromoCodeDto, formCreatePromoCodeSchema } from '@/schemas/promo-code/promo-code-schema';
import { useCreatePromoCode } from '@/hooks/use-promo-codes';
import { EPromoCodeType } from '@/types/promo-code';

// Import các form sections
import { BasicInfoSection, DiscountSettingsSection, FormActions, TimeAndLimitSection } from './form-sections';

export function PromoCodeForm() {
    const router = useRouter();
    const { mutate: createPromoCode, isPending } = useCreatePromoCode();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Khởi tạo form với giá trị mặc định
    const form = useForm<CreatePromoCodeDto>({
        resolver: zodResolver(formCreatePromoCodeSchema),
        defaultValues: {
            code: '',
            description: '',
            type: EPromoCodeType.PercentageDiscount,
            discountPercentage: 0,
            discountAmount: 0,
            freeShipping: false,
            validFrom: new Date(),
            validTo: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Mặc định hết hạn sau 1 tháng
            usageLimit: 1, // Ensure usageLimit has a valid default value
            isActive: true,
        },
    });

    const handleSubmit = async (values: CreatePromoCodeDto) => {
        setIsSubmitting(true);

        try {
            createPromoCode(values);
        } catch (error) {
            logger.error('Error submitting promo code:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <BasicInfoSection
                    form={form}
                />

                <DiscountSettingsSection
                    form={form}
                />

                <TimeAndLimitSection
                    form={form}
                />

                <FormActions
                    isSubmitting={isSubmitting}
                    isPending={isPending}
                    onCancel={handleCancel}
                    submitText="Thêm mới"
                    cancelText="Hủy"
                />
            </form>
        </Form>
    );
}
