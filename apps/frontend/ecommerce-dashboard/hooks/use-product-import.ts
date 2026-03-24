// hooks/use-product-import.ts
import { useMutation } from '@tanstack/react-query';
import { productImportExportService } from '@/services/product-import-export-service';
import { toast } from './use-toast';
import { handleApiError } from '@/lib/api-error';

interface ImportResult {
    totalItems: number;
    successCount: number;
    errorCount: number;
    addedCount: number;
    updatedCount: number;
    deletedCount: number;
    errors: string[];
    errorItems: any[];
}

export const useProductImport = () => {
    const importMutation = useMutation({
        mutationFn: async (params: { file: File; validateOnly: boolean }) => {
            return productImportExportService.importProducts(params.file, params.validateOnly);
        },
        onSuccess: (data) => {
            if (data.success) {
                const actionWord = data.data.validateOnly ? 'đã được kiểm tra' : 'đã được nhập';
                const successToast = {
                    title: `Sản phẩm ${actionWord} thành công`,
                    description: data.data.validateOnly
                        ? `${data.data.totalItems} sản phẩm đã được kiểm tra với ${data.data.errorCount} lỗi.`
                        : `Thêm mới: ${data.data.addedCount}, Cập nhật: ${data.data.updatedCount}, Xóa: ${data.data.deletedCount}`,
                };

                toast(successToast);
                return data.data as ImportResult;
            } else {
                toast({
                    title: 'Nhập dữ liệu thất bại',
                    description: data.error || 'Có lỗi xảy ra khi nhập dữ liệu sản phẩm',
                    variant: 'destructive',
                });
            }
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'importProducts' },
                devTitle: 'Nhập dữ liệu thất bại',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        },
    });

    const templateMutation = useMutation({
        mutationFn: async (format: string) => {
            return productImportExportService.downloadTemplate(format);
        },
        onSuccess: (data) => {
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Mau_import_san_pham.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast({
                title: 'Đã tải mẫu import',
                description: 'File mẫu import sản phẩm đã được tải về',
            });
        },
        onError: () => {
            toast({
                title: 'Tải mẫu thất bại',
                description: 'Không thể tải file mẫu',
                variant: 'destructive',
            });
        },
    });

    return {
        importMutation,
        templateMutation,
    };
};