"use client";

import { logger } from '@/lib/logger'
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UpdateCategoryDto, formUpdateCategorySchema } from '@/schemas/category';
import { BasicInfoSection } from './form-sections/basic-info';
import { AdditionalInfoSection } from './form-sections/additional-info';
import { StatusSection } from './form-sections/status';
import { ImageUploadSection } from './form-sections/image-upload';
import { useUpdateCategory } from '@/hooks/use-categories';
import { Category } from '@/types/category';
import { ChildrenInfoSection } from './form-sections/children-info';
import { useGetProductsByCategory } from '@/hooks/use-products';
import { ProductTable } from './form-sections/products-by-category';

interface CategoryFormProps {
    category: Category;
    isDetail?: boolean;
}

export function EditCategoryForm({ category, isDetail = false }: CategoryFormProps) {
    const router = useRouter();
    const { mutate: updateCategory } = useUpdateCategory();
    const { data: products } = useGetProductsByCategory(category.id);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<UpdateCategoryDto>({
        resolver: zodResolver(formUpdateCategorySchema),
        defaultValues: {
            code: '',
            name: '',
            description: '',
            slug: '',
            parentId: undefined,
            isActive: true,
            image: '',
        },
    });

    // Load dữ liệu sản phẩm hiện tại vào form
    useEffect(() => {
        if (category) {
            logger.debug('Initial product data:', category);

            // Chuyển đổi dữ liệu từ API vào form values
            const defaultValues = {
                id: category.id,
                code: category.code,
                name: category.name,
                description: category.description,
                slug: category.slug,
                parentId: category.parentId,
                isActive: category.isActive,
                image: category.image,
                children: category.children,
                brandIds: category.brandIds || [],
            };

            logger.debug('Setting form values:', defaultValues);
            form.reset(defaultValues);
        }
    }, [category, form]);

    const handleSubmit = async (values: UpdateCategoryDto) => {

        setIsSubmitting(true);
        logger.debug('Setting form values:', values);
        try {
            updateCategory(values as UpdateCategoryDto);
        } catch (error) {
            logger.error('Error submitting category:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <BasicInfoSection form={form} isDetail={isDetail} />

                        <AdditionalInfoSection form={form} isDetail={isDetail} />

                        <ImageUploadSection form={form} isEditing={true} isDetail={isDetail} />

                        <StatusSection form={form} isDetail={isDetail} />

                        <ChildrenInfoSection form={form} />



                    </div>
                    {isDetail && products && products.data && products.data.length > 0 && (
                        <ProductTable data={products?.data || []} />
                    )}

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

        </>

    );
}
