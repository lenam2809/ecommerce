import { Metadata } from 'next';
import { BannerForm } from '@/components/banners/banner-form';
import { FormSection } from '@/components/ui/form-section';

export const metadata: Metadata = {
    title: 'Thêm banner mới',
    description: 'Thêm banner mới vào hệ thống',
};

export default function AddBannerPage() {
    return (
        <FormSection title="Thêm banner mới" description="Điền đầy đủ thông tin để thêm banner mới vào hệ thống">
            <BannerForm />
        </FormSection>
    );
}