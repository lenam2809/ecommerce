import { Metadata } from 'next';
import { BrandForm } from '@/components/brands/brand-form';
import { FormSection } from '@/components/ui/form-section';

export const metadata: Metadata = {
    title: 'Thêm thương hiệu mới',
    description: 'Thêm thương hiệu mới vào hệ thống',
};

export default function AddBrandPage() {
    return (
        <FormSection title="Thêm thương hiệu mới" description="Điền đầy đủ thông tin để thêm thương hiệu mới vào hệ thống">
            <BrandForm />
        </FormSection>
    );
}