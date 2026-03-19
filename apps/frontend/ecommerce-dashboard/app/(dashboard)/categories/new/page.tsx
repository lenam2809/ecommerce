import { Metadata } from 'next';
import { CategoryForm } from '@/components/categories/category-form';
import { FormSection } from '@/components/ui/form-section';

export const metadata: Metadata = {
    title: 'Thêm danh mục sản phẩm mới',
    description: 'Thêm danh mục sản phẩm mới vào hệ thống',
};

export default function AddCategoryPage() {
    return (
        <FormSection title="Thêm danh mục sản phẩm mới" description="Điền đầy đủ thông tin để thêm danh mục sản phẩm mới vào hệ thống">
            <CategoryForm />
        </FormSection>
    );
}