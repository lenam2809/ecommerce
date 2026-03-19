import { Metadata } from 'next';
import { FormSection } from '@/components/ui/form-section';
import { UserForm } from '@/components/users/user-form';

export const metadata: Metadata = {
    title: 'Thêm người dùng mới',
    description: 'Thêm sản phẩm mới vào hệ thống',
};

export default function AddUserPage() {
    return (
        <FormSection title="Thêm người dùng mới" description="Điền đầy đủ thông tin để thêm người dùng mới vào hệ thống">
            <UserForm />
        </FormSection>
    );
}