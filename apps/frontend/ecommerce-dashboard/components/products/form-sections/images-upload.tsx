import { useState, useCallback, useEffect } from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormSection } from '@/components/ui/form-section';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageIcon, PlusIcon, X } from 'lucide-react';
import Image from 'next/image';

interface ImagesUploadSectionProps {
    form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    isEditing?: boolean;
    isDetail?: boolean;
}

export function ImagesUploadSection({ form, isEditing = false, isDetail = false }: ImagesUploadSectionProps) {
    const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);

    // Khởi tạo preview từ dữ liệu hiện có khi chỉnh sửa hoặc xem chi tiết
    useEffect(() => {
        if (isEditing || isDetail) {
            const mainImage = form.getValues('mainImage');
            const additionalImages = form.getValues('additionalImages') || [];


            console.log("mainImage: ", mainImage)
            // Nếu mainImage là URL (string), sử dụng trực tiếp
            if (typeof mainImage === 'string') {
                setMainImagePreview(mainImage);
            }

            // Nếu additionalImages là mảng các URL, sử dụng chúng
            if (Array.isArray(additionalImages)) {
                setAdditionalImagePreviews(additionalImages.filter((img: string | File) => typeof img === 'string'));
            }
        }
    }, [form, isEditing, isDetail]);

    const handleMainImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue('mainImage', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setMainImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, [form]);

    const handleAdditionalImagesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFiles = Array.from(files);
            const currentFiles = form.getValues('additionalImages') || [];
            form.setValue('additionalImages', [...currentFiles, ...newFiles]);

            const fileReaders = newFiles.map((file) => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(fileReaders).then((results) => {
                setAdditionalImagePreviews([...additionalImagePreviews, ...results]);
            });
        }
    }, [form, additionalImagePreviews]);

    const removeAdditionalImage = useCallback((index: number) => {
        const currentFiles = form.getValues('additionalImages') || [];
        const newFiles = [...currentFiles];
        newFiles.splice(index, 1);
        form.setValue('additionalImages', newFiles);

        const newPreviews = [...additionalImagePreviews];
        newPreviews.splice(index, 1);
        setAdditionalImagePreviews(newPreviews);
    }, [form, additionalImagePreviews]);

    return (
        <FormSection title="Hình ảnh sản phẩm">
            <div className="space-y-6">
                <FormField
                    control={form.control}
                    name="mainImage"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Hình ảnh chính *</FormLabel>
                            <div className="flex flex-col items-center space-y-4">
                                <div
                                    className={`border-2 border-dashed border-gray-300 rounded-lg p-8 w-full max-w-md flex flex-col items-center justify-center ${!isDetail ? 'cursor-pointer hover:border-primary transition-colors' : ''
                                        }`}
                                    onClick={() => !isDetail && document.getElementById('mainImageInput')?.click()}
                                >
                                    {mainImagePreview ? (
                                        <div className="relative w-48 h-48">
                                            <Image
                                                src={mainImagePreview}
                                                alt="Hình ảnh chính"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">
                                                {isDetail ? 'Không có hình ảnh' : 'Click để tải lên hình ảnh chính'}
                                            </p>
                                        </>
                                    )}
                                </div>
                                {!isDetail && (
                                    <FormControl>
                                        <Input
                                            id="mainImageInput"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleMainImageChange}
                                            ref={field.ref}
                                            name={field.name}
                                            onBlur={field.onBlur}
                                        />
                                    </FormControl>
                                )}
                                <FormDescription>
                                    Hãy chọn một hình ảnh chất lượng cao để đại diện cho sản phẩm của bạn
                                </FormDescription>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="additionalImages"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Hình ảnh bổ sung</FormLabel>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {additionalImagePreviews.map((preview, index) => (
                                        <div key={index} className="relative rounded-md overflow-hidden h-32 bg-gray-100">
                                            <Image
                                                src={preview}
                                                alt={`Hình ảnh ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                            {!isDetail && (
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 w-6 h-6"
                                                    onClick={() => removeAdditionalImage(index)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {!isDetail && (
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                                            onClick={() => document.getElementById('additionalImagesInput')?.click()}
                                        >
                                            <PlusIcon className="w-8 h-8 text-gray-400" />
                                            <p className="text-xs text-gray-500 mt-1">Thêm hình ảnh</p>
                                        </div>
                                    )}
                                </div>
                                {!isDetail && (
                                    <FormControl>
                                        <Input
                                            id="additionalImagesInput"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleAdditionalImagesChange}
                                            ref={field.ref}
                                            name={field.name}
                                            onBlur={field.onBlur}
                                        />
                                    </FormControl>
                                )}
                                <FormDescription>
                                    Bạn có thể tải lên nhiều hình ảnh để hiển thị chi tiết sản phẩm
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