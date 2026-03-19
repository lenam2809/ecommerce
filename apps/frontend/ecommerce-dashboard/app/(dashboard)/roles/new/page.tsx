import { Metadata } from 'next';
import { FormSection } from '@/components/ui/form-section';
import { RoleForm } from '@/components/roles/role-form';

export const metadata: Metadata = {
    title: "Thêm vai trò mới",
    description: "Tạo mới vai trò trong hệ thống",
};

export default function AddRolePage() {
    return (
        <FormSection title="Thêm vai trò mới" description="Điền đầy đủ thông tin để thêm vai trò mới vào hệ thống">
            <RoleForm />
        </FormSection>
    );
}