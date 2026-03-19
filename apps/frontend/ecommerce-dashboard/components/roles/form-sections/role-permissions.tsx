// components/roles/form-sections/role-permissions.tsx
import { useGetOptionPermissions, useGetRolePermissions } from '@/hooks/use-permissions';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { FormSection } from '@/components/ui/form-section';
import { MultiSelect } from '@/components/ui/select/multi-select';
import { useEffect, useState } from 'react';
import { OptionType } from '@/components/ui/select/single-select';
import { Skeleton } from '@/components/ui/skeleton';

interface RolePermissionsSectionProps {
    form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    isDetail?: boolean;
}

export function RolePermissionsSection({ form, isDetail }: RolePermissionsSectionProps) {
    const [options, setOptions] = useState<OptionType[]>([]);
    const { data: permissionsData, isLoading } = useGetOptionPermissions();

    const roleId = form.watch('id'); // Lấy ID của vai trò từ form
    // Lấy quyền hạn của vai trò hiện tại
    const { data: rolePermissionsData } = useGetRolePermissions(roleId);

    // Khi có dữ liệu quyền hạn của vai trò, cập nhật giá trị cho trường permissions trong form
    useEffect(() => {
        if (rolePermissionsData && rolePermissionsData.data) {
            const selectedPermissionIds = rolePermissionsData.data.map((p: any) => p.id); // eslint-disable-line @typescript-eslint/no-explicit-any
            form.setValue('permissions', selectedPermissionIds);
        }
    }, [rolePermissionsData, form]);

    useEffect(() => {
        if (permissionsData && permissionsData.data) {
            setOptions(permissionsData.data);
        }
    }, [permissionsData]);

    if (isLoading) {
        return (
            <FormSection title="Quyền hạn">
                <Skeleton className="h-10 w-full" />
            </FormSection>
        );
    }

    return (
        <FormSection title="Quyền hạn">
            <div className="grid grid-cols-1 gap-4">
                <FormField
                    control={form.control}
                    name="permissions"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Chọn quyền hạn</FormLabel>
                            <FormControl>
                                <MultiSelect
                                    placeholder="Chọn quyền hạn"
                                    options={options}
                                    values={field.value || []}
                                    onChange={field.onChange}
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