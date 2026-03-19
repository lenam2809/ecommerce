"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CreateCategoryDto, formCreateCategorySchema } from '@/schemas/category';
import { BasicInfoSection } from './form-sections/basic-info';
import { AdditionalInfoSection } from './form-sections/additional-info';
import { StatusSection } from './form-sections/status';
import { ImageUploadSection } from './form-sections/image-upload';
import { useCreateCategory } from '@/hooks/use-categories';



export function CategoryForm() {
    const router = useRouter();
    const { mutate: createCategory } = useCreateCategory();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CreateCategoryDto>({
        resolver: zodResolver(formCreateCategorySchema),
        defaultValues: {
            code: '',
            name: '',
            description: '',
            parentId: undefined,
            isActive: true,
            image: undefined as unknown as File,
        },
    });


    const handleSubmit = async (values: CreateCategoryDto) => {
        setIsSubmitting(true);

        try {
            createCategory(values);
        } catch (error) {
            console.error('Error submitting category:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <BasicInfoSection form={form} />
                    <AdditionalInfoSection form={form} />
                    <ImageUploadSection form={form} />
                    <StatusSection form={form} />
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