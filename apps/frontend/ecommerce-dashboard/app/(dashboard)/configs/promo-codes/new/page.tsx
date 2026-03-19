import { Metadata } from 'next';
import { PromoCodeForm } from '@/components/promo-codes/promo-code-form';
import { FormSection } from '@/components/ui/form-section';

export const metadata: Metadata = {
    title: 'Thêm promo-code mới',
    description: 'Thêm promo-code mới vào hệ thống',
};

export default function AddPromoCodePage() {
    return (
        <FormSection title="Thêm promo-code mới" description="Điền đầy đủ thông tin để thêm promo-code mới vào hệ thống">
            <PromoCodeForm />
        </FormSection>
    );
}