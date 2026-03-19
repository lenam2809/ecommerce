"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CreateBrandDto, formCreateBrandSchema } from '@/schemas/brand';
import { BasicInfoSection } from './form-sections/basic-info';
import { useCreateBrand } from '@/hooks/use-brands';
import { ImagesUploadSection } from './form-sections/images-upload';

export function BrandForm() {
    const router = useRouter();
    const { mutate: createBrand } = useCreateBrand();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CreateBrandDto>({
        resolver: zodResolver(formCreateBrandSchema),
        defaultValues: {
            code: '',
            name: '',
            description: '',
            logo: undefined as unknown as File,
            isActive: true,
            categoryIds: []
        },
    });


    const handleSubmit = async (values: CreateBrandDto) => {
        setIsSubmitting(true);
        try {
            createBrand(values);
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
                    <BasicInfoSection form={form} />
                    <ImagesUploadSection form={form} />
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

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Thêm mới
                    </Button>
                </div>
            </form>
        </Form>
    );
}