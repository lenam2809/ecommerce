import { Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserStatus } from '@/types/user';
import { FormSingleSelect } from '@/components/ui/select/form-single-select';

interface StatusSectionProps {
    form: { control: Control<any> }; // eslint-disable-line @typescript-eslint/no-explicit-any
    isDetail?: boolean;
}

export function StatusSection({ form, isDetail = false }: StatusSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Trạng thái</CardTitle>
            </CardHeader>
            <CardContent>
                <FormSingleSelect<number>
                    control={form.control}
                    name="status"
                    label="Trạng thái người dùng"
                    placeholder="Chọn trạng thái"
                    defaultValue={UserStatus.Active}
                    options={[
                        { value: UserStatus.Active, label: "Hoạt động" },
                        { value: UserStatus.Inactive, label: "Không hoạt động" },
                        { value: UserStatus.Suspended, label: "Bị cấm" },
                        { value: UserStatus.Deleted, label: "Đã xóa" },
                    ]}
                    disabled={isDetail}
                    description='Trạng thái xác định khả năng đăng nhập vào hệ thống'
                />
            </CardContent>
        </Card>
    );
}