// src/components/users/form-sections/role.tsx
import { Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/types/user';
import { FormMultiSelect } from '@/components/ui/select/form-multi-select';

interface RoleSectionProps {
    form: { control: Control<any> }; // eslint-disable-line @typescript-eslint/no-explicit-any
    isDetail?: boolean;
}

export function RoleSection({ form, isDetail = false }: RoleSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Vai trò người dùng</CardTitle>
            </CardHeader>
            <CardContent>
                <FormMultiSelect
                    control={form.control}
                    name="roles"
                    label="Chọn vai trò"
                    placeholder="Chọn vai trò"
                    options={[
                        { value: UserRole.Admin, label: "Quản trị viên" },
                        { value: UserRole.Manager, label: "Quản lý" },
                        { value: UserRole.Staff, label: "Nhân viên" },
                        { value: UserRole.Customer, label: "Khách hàng" },
                    ]}
                    disabled={isDetail}
                    description='Phân quyền truy cập hệ thống'
                />
            </CardContent>
        </Card>
    );
}