import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { FormSection } from '@/components/ui/form-section';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface BasicInfoSectionProps {
    form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    isDetail?: boolean;
}

export function BasicInfoSection({ form, isDetail }: BasicInfoSectionProps) {
    return (
        <FormSection title="Thông tin cơ bản">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tiêu đề</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Nhập tiêu đề banner"
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
                                    placeholder="Nhập mô tả banner"
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

export function ButtonSection({ form, isDetail }: BasicInfoSectionProps) {
    return (
        <FormSection title="Cấu hình nút">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="buttonText"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nội dung nút</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Nhập nội dung nút"
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
                    name="buttonLink"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Đường dẫn nút</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Nhập đường dẫn nút"
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

export function SettingsSection({ form, isDetail }: BasicInfoSectionProps) {
    return (
        <FormSection title="Cài đặt">
            <div className="grid grid-cols-1 gap-4">
                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    Trạng thái hoạt động
                                </FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    Bật/tắt trạng thái hiển thị của banner
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