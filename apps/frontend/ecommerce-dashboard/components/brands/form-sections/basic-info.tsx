import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { FormSection } from '@/components/ui/form-section';
import { Input } from '@/components/ui/input';
import { FormMultiSelect } from '@/components/ui/select/form-multi-select';
import { Textarea } from '@/components/ui/textarea';
import { useGetOptionCategories } from '@/hooks/use-categories';

interface BasicInfoSectionProps {
    form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    isDetail?: boolean;
}

export function BasicInfoSection({ form, isDetail }: BasicInfoSectionProps) {
    const { data: categories, isLoading: categoriesLoading } = useGetOptionCategories();

    return (
        <>
            <FormSection title="Thông tin cơ bản">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mã thương hiệu</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Nhập mã thương hiệu"
                                        {...field}
                                        disabled={isDetail}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tên thương hiệu</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Nhập tên thương hiệu"
                                        {...field}
                                        disabled={isDetail}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {isDetail && (
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Nhập link danh mục"
                                            {...field}
                                            disabled={isDetail}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Mô tả</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Nhập mô tả thương hiệu"
                                        className="min-h-[100px]"
                                        {...field}
                                        value={field.value ?? ''}
                                        disabled={isDetail}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />



                </div>

            </FormSection>
            <FormSection title="Thông tin loại sản phẩm">
                <FormMultiSelect
                    name="categoryIds"
                    label="Loại sản phẩm"
                    className="col-span-2"
                    placeholder="Chọn loại sản phẩm"
                    options={categories?.data || []}
                    isLoading={categoriesLoading}
                    loadingMessage='Đang tải loại sản phẩm...'
                    disabled={isDetail}
                />
            </FormSection>
        </>
    );
}