import { Metadata } from 'next';
import { MarqueeForm } from '@/components/marquee/marquee-form';
import { FormSection } from '@/components/ui/form-section';

export const metadata: Metadata = {
    title: 'Thêm tin nhắn Marquee mới | E-Commerce Dashboard',
    description: 'Thêm tin nhắn marquee mới vào hệ thống',
};

export default function AddMarqueePage() {
    return (
        <FormSection
            title="Thêm tin nhắn Marquee mới"
            description="Điền đầy đủ thông tin để thêm tin nhắn marquee mới vào hệ thống"
        >
            <MarqueeForm />
        </FormSection>
    );
}
