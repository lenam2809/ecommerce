import { Metadata } from 'next';
import { FormSection } from '@/components/ui/form-section';
import { PermissionForm } from '@/components/permissions/permission-form';

export const metadata: Metadata = {
    title: "Thêm quyền mới",
    description: "Tạo mới quyền trong hệ thống",
};

export default function AddPermissionPage() {
    return (
        <FormSection title="Thêm quyền mới" description="Điền đầy đủ thông tin để thêm quyền mới vào hệ thống">
            <PermissionForm />
        </FormSection>
    );
}