"use client";

import { logger } from '@/lib/logger'
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UpdateBannerDto, formUpdateBannerSchema } from '@/schemas/banner/banner-schema';
import { BasicInfoSection, ButtonSection, SettingsSection } from './form-sections/basic-info';
import { Banner } from '@/types/banner';
import { useUpdateBanner } from '@/hooks/use-banners';
import { ImageUploadSection } from './form-sections/image-upload';

interface BannerFormProps {
    banner: Banner;
    isDetail?: boolean;
}

export function EditBannerForm({ banner, isDetail = false }: BannerFormProps) {
    const router = useRouter();
    const { mutate: updateBanner } = useUpdateBanner();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<UpdateBannerDto>({
        resolver: zodResolver(formUpdateBannerSchema),
        defaultValues: {
            id: '',
            title: '',
            description: '',
            image: '',
            buttonText: '',
            buttonLink: '',
            isActive: true,
        },
    });

    // Load dữ liệu banner hiện tại vào form
    useEffect(() => {
        if (banner) {
            logger.debug('Initial banner data:', banner);

            // Chuyển đổi dữ liệu từ API vào form values
            const defaultValues = {
                id: banner.id,
                title: banner.title,
                description: banner.description,
                imageUrl: banner.imageUrl,
                buttonText: banner.buttonText,
                buttonLink: banner.buttonLink,
                isActive: banner.isActive,
            };

            logger.debug('Setting form values:', defaultValues);
            form.reset(defaultValues);
        }
    }, [banner, form]);

    const handleSubmit = async (values: UpdateBannerDto) => {
        setIsSubmitting(true);

        try {
            updateBanner(values as UpdateBannerDto);
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
                    <BasicInfoSection form={form} isDetail={isDetail} />
                    <ImageUploadSection form={form} isEditing={!isDetail} isDetail={isDetail} />
                    <ButtonSection form={form} isDetail={isDetail} />
                    <SettingsSection form={form} isDetail={isDetail} />
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
