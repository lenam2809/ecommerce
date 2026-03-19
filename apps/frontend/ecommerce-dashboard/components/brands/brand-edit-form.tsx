"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UpdateBrandDto, formUpdateBrandSchema } from '@/schemas/brand';
import { BasicInfoSection } from './form-sections/basic-info';
import { Brand } from '@/types/brand';
import { useUpdateBrand } from '@/hooks/use-brands';
import { ImagesUploadSection } from './form-sections/images-upload';

interface BrandFormProps {
    brand: Brand;
    isDetail?: boolean;
}

export function EditBrandForm({ brand, isDetail = false }: BrandFormProps) {
    const router = useRouter();
    const { mutate: updateBrand } = useUpdateBrand();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<UpdateBrandDto>({
        resolver: zodResolver(formUpdateBrandSchema),
        defaultValues: {
            code: '',
            name: '',
            description: '',
            slug: '',
            logo: undefined,
            isActive: true,
            categoryIds: []
        },
    });

    // Load dữ liệu sản phẩm hiện tại vào form
    useEffect(() => {
        if (brand) {
            // Chuyển đổi dữ liệu từ API vào form values
            const defaultValues = {
                id: brand.id,
                code: brand.code,
                name: brand.name,
                description: brand.description,
                slug: brand.slug || '',
                logo: brand.logoUrl,
                isActive: brand.isActive,
                categoryIds: brand.categoryIds || []
            };

            console.log('Setting form values:', defaultValues);
            form.reset(defaultValues);
        }
    }, [brand, form]);

    const handleSubmit = async (values: UpdateBrandDto) => {
        setIsSubmitting(true);

        try {
            updateBrand(values as UpdateBrandDto);
        } catch (error) {
            console.error('Error submitting brand:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <BasicInfoSection form={form} isDetail={isDetail} />
                    <ImagesUploadSection form={form} isEditing={true} isDetail={isDetail} />
                </div>

                <div className="flex gap-4 justify-end mt-8">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </Button>
                    {!isDetail && (
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Cập nhật
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    );
}