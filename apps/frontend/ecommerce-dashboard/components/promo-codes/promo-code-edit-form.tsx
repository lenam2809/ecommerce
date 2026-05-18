// components/promo-code/promo-code-edit-form.tsx
"use client";

import { logger } from '@/lib/logger'
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { UpdatePromoCodeDto, formUpdatePromoCodeSchema } from '@/schemas/promo-code/promo-code-schema';
import { useUpdatePromoCode } from '@/hooks/use-promo-codes';
import { EPromoCodeType, PromoCode } from '@/types/promo-code';
import { BasicInfoSection, DiscountSettingsSection, FormActions, TimeAndLimitSection } from './form-sections';


interface PromoCodeEditFormProps {
    promoCode: PromoCode;
    isDetail?: boolean;
}

export function PromoCodeEditForm({ promoCode, isDetail = false }: PromoCodeEditFormProps) {
    const router = useRouter();
    const { mutate: updatePromoCode, isPending } = useUpdatePromoCode();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Khởi tạo form
    const form = useForm<UpdatePromoCodeDto>({
        resolver: zodResolver(formUpdatePromoCodeSchema),
        defaultValues: {
            id: '',
            code: '',
            description: '',
            type: EPromoCodeType.PercentageDiscount,
            discountPercentage: 0,
            discountAmount: 0,
            freeShipping: false,
            validFrom: new Date(),
            validTo: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            usageLimit: 0,
            isActive: true,
        },
    });

    // Cập nhật giá trị form khi có dữ liệu
    useEffect(() => {
        if (promoCode) {
            form.reset({
                id: promoCode.id,
                code: promoCode.code,
                description: promoCode.description || '',
                type: promoCode.type as any, // eslint-disable-line @typescript-eslint/no-explicit-any
                discountPercentage: promoCode.discountPercentage,
                discountAmount: promoCode.discountAmount,
                freeShipping: promoCode.freeShipping,
                validFrom: new Date(promoCode.validFrom),
                validTo: new Date(promoCode.validTo),
                usageLimit: promoCode.usageLimit,
                isActive: promoCode.isActive,
            });
        }
    }, [promoCode, form]);

    const handleSubmit = async (values: UpdatePromoCodeDto) => {
        setIsSubmitting(true);

        try {
            updatePromoCode(values);
        } catch (error) {
            logger.error('Error updating promo code:', error);
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
                    isDetail={isDetail}
                />

                <DiscountSettingsSection
                    form={form}
                    isDetail={isDetail}
                />

                <TimeAndLimitSection
                    form={form}
                    promoCode={promoCode}
                    isDetail={isDetail}
                />

                <FormActions
                    isDetail={isDetail}
                    isSubmitting={isSubmitting}
                    isPending={isPending}
                    onCancel={handleCancel}
                    submitText="Cập nhật"
                    cancelText="Hủy"
                />
            </form>
        </Form>
    );
}
