import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { FormSection } from '@/components/ui/form-section';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface PermissionInfoSectionProps {
    form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    isDetail?: boolean;
}

export function PermissionInfoSection({ form, isDetail }: PermissionInfoSectionProps) {
    return (
        <FormSection title="Thông tin cơ bản">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên quyền</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Nhập tên quyền"
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
                    name="description"
                    render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel>Mô tả</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Nhập mô tả quyền"
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

                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel>Tên nhóm quyền</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Nhập tên nhóm quyền"
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
    );
}