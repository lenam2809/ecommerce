import { logger } from '@/lib/logger'
import { useState, useCallback, useEffect } from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormSection } from '@/components/ui/form-section';
import { Input } from '@/components/ui/input';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface AvatarUploadSectionProps {
    form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    isEditing?: boolean;
    isDetail?: boolean;
}

export function AvatarUploadSection({ form, isEditing = false, isDetail = false }: AvatarUploadSectionProps) {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Khởi tạo preview từ dữ liệu hiện có khi chỉnh sửa hoặc xem chi tiết
    useEffect(() => {
        if (isEditing || isDetail) {
            const avatar = form.getValues('avatar');

            logger.debug("avatar: ", avatar)
            // Nếu avatar là URL (string), sử dụng trực tiếp
            if (typeof avatar === 'string') {
                setAvatarPreview(avatar);
            }
        }
    }, [form, isEditing, isDetail]);

    const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, [form]);


    return (
        <FormSection title="Ảnh đại diện">
            <div className="space-y-6">
                <FormField
                    control={form.control}
                    name="avatar"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tải ảnh đại diện *</FormLabel>
                            <div className="flex flex-col items-center space-y-4">
                                <div
                                    className={`border-2 border-dashed border-gray-300 rounded-lg p-8 w-full max-w-md flex flex-col items-center justify-center ${!isDetail ? 'cursor-pointer hover:border-primary transition-colors' : ''
                                        }`}
                                    onClick={() => !isDetail && document.getElementById('avatarInput')?.click()}
                                >
                                    {avatarPreview ? (
                                        <div className="relative w-48 h-48">
                                            <Image
                                                src={avatarPreview}
                                                alt="Tải ảnh đại diện"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">
                                                {isDetail ? 'Không có hình ảnh' : 'Click để tải lên ảnh đại diện'}
                                            </p>
                                        </>
                                    )}
                                </div>
                                {!isDetail && (
                                    <FormControl>
                                        <Input
                                            id="avatarInput"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarChange}
                                            ref={field.ref}
                                            name={field.name}
                                            onBlur={field.onBlur}
                                        />
                                    </FormControl>
                                )}
                                <FormDescription>
                                    Hãy chọn một hình ảnh chất lượng cao để đại diện cho bạn
                                </FormDescription>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </FormSection>
    );
}