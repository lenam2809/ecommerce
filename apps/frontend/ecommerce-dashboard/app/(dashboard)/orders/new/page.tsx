import { Metadata } from 'next';
import { FormSection } from '@/components/ui/form-section';
import { OrderForm } from '@/components/orders/order-form';

export const metadata: Metadata = {
    title: "Thêm đơn hàng mới",
    description: "Tạo mới đơn hàng trong hệ thống",
};

export default function AddOrderPage() {
    return (
        <FormSection title="Thêm đơn hàng mới" description="Điền đầy đủ thông tin để thêm đơn hàng mới vào hệ thống">
            <OrderForm />
        </FormSection>
    );
}