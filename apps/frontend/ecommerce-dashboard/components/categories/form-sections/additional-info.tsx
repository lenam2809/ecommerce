import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormSingleSelect } from '@/components/ui/select/form-single-select';
import { useGetOptionCategories } from '@/hooks/use-categories';
import { FormSection } from '@/components/ui/form-section';

interface AdditionalInfoSectionProps {
    form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    isDetail?: boolean;
}

export function AdditionalInfoSection({ form, isDetail }: AdditionalInfoSectionProps) {
    const { data: categories, isLoading: categoriesLoading } = useGetOptionCategories();
    return (
        <FormSection title="Thông tin bổ sung">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <FormSingleSelect
                    name="parentId"
                    label="Danh mục cha"
                    placeholder="Chọn danh mục cha"
                    options={categories?.data || []}
                    isLoading={categoriesLoading}
                    loadingMessage='Đang tải danh mục...'
                    disabled={isDetail}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel>Mô tả</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Nhập mô tả danh mục"
                                    className="min-h-[100px]"
                                    {...field}
                                    disabled={isDetail}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </FormSection>
    );
}