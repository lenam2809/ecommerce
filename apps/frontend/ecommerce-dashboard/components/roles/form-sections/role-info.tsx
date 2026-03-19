// components/roles/form-sections/role-info.tsx
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { FormSection } from '@/components/ui/form-section';
import { Input } from '@/components/ui/input';

interface RoleInfoSectionProps {
    form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    isDetail?: boolean;
}

export function RoleInfoSection({ form, isDetail }: RoleInfoSectionProps) {
    return (
        <FormSection title="Thông tin cơ bản">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên vai trò</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Nhập tên vai trò"
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