import { Metadata } from 'next';
import { ProductForm } from '@/components/products/product-form';
import { FormSection } from '@/components/ui/form-section';

export const metadata: Metadata = {
  title: 'Thêm sản phẩm mới',
  description: 'Thêm sản phẩm mới vào hệ thống',
};

export default function AddProductPage() {
  return (
    <FormSection title="Thêm sản phẩm mới" description="Điền đầy đủ thông tin để thêm sản phẩm mới vào hệ thống">
      <ProductForm />
    </FormSection>
  );
}