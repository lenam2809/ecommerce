import { useState, useCallback, useEffect } from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormSection } from '@/components/ui/form-section';
import { Input } from '@/components/ui/input';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImagesUploadSectionProps {
    form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    isEditing?: boolean;
    isDetail?: boolean;
}

export function ImagesUploadSection({ form, isEditing = false, isDetail = false }: ImagesUploadSectionProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // Khởi tạo preview từ dữ liệu hiện có khi chỉnh sửa hoặc xem chi tiết
    useEffect(() => {
        if (isEditing || isDetail) {
            const logo = form.getValues('logo');

            console.log('Current logo value:', logo);
            // Nếu logo là URL (string), sử dụng trực tiếp
            if (typeof logo === 'string') {
                setLogoPreview(logo);
            }
        }
    }, [form, isEditing, isDetail]);

    const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, [form]);


    return (
        <FormSection title="Logo thương hiệu">
            <div className="space-y-6">
                <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Logo *</FormLabel>
                            <div className="flex flex-col items-center space-y-4">
                                <div
                                    className={`border-2 border-dashed border-gray-300 rounded-lg p-8 w-full max-w-md flex flex-col items-center justify-center ${!isDetail ? 'cursor-pointer hover:border-primary transition-colors' : ''
                                        }`}
                                    onClick={() => !isDetail && document.getElementById('logoInput')?.click()}
                                >
                                    {logoPreview ? (
                                        <div className="relative w-48 h-48">
                                            <Image
                                                src={logoPreview}
                                                alt="Logo preview"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">
                                                {isDetail ? 'Không có hình ảnh' : 'Click để tải lên logo thương hiệu'}
                                            </p>
                                        </>
                                    )}
                                </div>
                                {!isDetail && (
                                    <FormControl>
                                        <Input
                                            id="logoInput"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleLogoChange}
                                            ref={field.ref}
                                            name={field.name}
                                            onBlur={field.onBlur}
                                        />
                                    </FormControl>
                                )}
                                <FormDescription>
                                    Hãy chọn một hình ảnh chất lượng cao để đại diện cho thương hiệu
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