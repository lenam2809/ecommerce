import { useState, useCallback, useEffect } from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormSection } from '@/components/ui/form-section';
import { Input } from '@/components/ui/input';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadSectionProps {
    form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    isEditing?: boolean;
    isDetail?: boolean;
}

export function ImageUploadSection({ form, isEditing = false, isDetail = false }: ImageUploadSectionProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Theo dõi giá trị 'image' từ form để cập nhật preview khi form.reset() được gọi
    const imageValue = form.watch('image');

    useEffect(() => {
        if ((isEditing || isDetail) && typeof imageValue === 'string' && imageValue) {
            setImagePreview(imageValue);
        }
    }, [imageValue, isEditing, isDetail]);

    const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, [form]);


    return (
        <FormSection title="Hình ảnh">
            <div className="space-y-6">
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tải lên hình ảnh *</FormLabel>
                            <div className="flex flex-col items-center space-y-4">
                                <div
                                    className={`border-2 border-dashed border-gray-300 rounded-lg p-8 w-full max-w-md flex flex-col items-center justify-center ${!isDetail ? 'cursor-pointer hover:border-primary transition-colors' : ''
                                        }`}
                                    onClick={() => !isDetail && document.getElementById('imageInput')?.click()}
                                >
                                    {imagePreview ? (
                                        <div className="relative w-48 h-48">
                                            <Image
                                                src={imagePreview}
                                                alt="Tải lên hình ảnh"
                                                fill
                                                className="object-contain"
                                                unoptimized
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">
                                                {isDetail ? 'Không có hình ảnh' : 'Click để tải lên hình ảnh'}
                                            </p>
                                        </>
                                    )}
                                </div>
                                {!isDetail && (
                                    <FormControl>
                                        <Input
                                            id="imageInput"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                            ref={field.ref}
                                            name={field.name}
                                            onBlur={field.onBlur}
                                        />
                                    </FormControl>
                                )}
                                <FormDescription>
                                    Hãy chọn một hình ảnh chất lượng cao để đại diện cho danh mục sản phẩm
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