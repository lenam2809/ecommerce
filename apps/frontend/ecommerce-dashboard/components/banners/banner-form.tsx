"use client";

import { logger } from '@/lib/logger'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CreateBannerDto, formCreateBannerSchema } from '@/schemas/banner/banner-schema';
import { BasicInfoSection, ButtonSection, SettingsSection } from './form-sections/basic-info';
import { useCreateBanner } from '@/hooks/use-banners';
import { ImageUploadSection } from './form-sections/image-upload';

export function BannerForm() {
    const router = useRouter();
    const { mutate: createBanner } = useCreateBanner();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CreateBannerDto>({
        resolver: zodResolver(formCreateBannerSchema),
        defaultValues: {
            title: '',
            description: '',
            image: undefined as unknown as File,
            buttonText: '',
            buttonLink: '',
            isActive: true,
        },
    });

    const handleSubmit = async (values: CreateBannerDto) => {
        setIsSubmitting(true);

        try {
            createBanner(values);
        } catch (error) {
            logger.error('Error submitting banner:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <BasicInfoSection form={form} />
                    <ImageUploadSection form={form} />
                    <ButtonSection form={form} />
                    <SettingsSection form={form} />
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
