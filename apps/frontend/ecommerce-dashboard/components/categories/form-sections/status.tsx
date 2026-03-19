import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { FormSection } from '@/components/ui/form-section';
import { FormMultiSelect } from '@/components/ui/select/form-multi-select';
import { Switch } from '@/components/ui/switch';
import { useGetOptionBrands } from '@/hooks/use-brands';

interface StatusSectionProps {
    form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    isDetail?: boolean;
}

export function StatusSection({ form, isDetail }: StatusSectionProps) {
    const { data: brands, isLoading: brandsLoading } = useGetOptionBrands();

    return (
        <FormSection title="Thương hiệu và trạng thái">
            <div className="grid grid-cols-1 gap-4">
                <FormMultiSelect
                    name="brandIds"
                    label="Thương hiệu"
                    className="col-span-2"
                    placeholder="Chọn thương hiệu"
                    options={brands?.data || []}
                    isLoading={brandsLoading}
                    loadingMessage='Đang tải thương hiệu...'
                    disabled={isDetail}
                />

                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex items-center space-x-3">
                            <div className="space-y-0.5">
                                <FormLabel>Kích hoạt</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    Danh mục sẽ hiển thị trên trang web khi được kích hoạt
                                </p>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isDetail}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
        </FormSection>
    );
}