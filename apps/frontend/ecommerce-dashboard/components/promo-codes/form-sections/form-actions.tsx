// components/promo-code/form-sections/form-actions.tsx
"use client";

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
    isDetail?: boolean;
    isSubmitting?: boolean;
    isPending?: boolean;
    onCancel: () => void;
    submitText?: string;
    cancelText?: string;
}

export function FormActions({
    isDetail = false,
    isSubmitting = false,
    isPending = false,
    onCancel,
    submitText = "Cập nhật",
    cancelText = "Hủy"
}: FormActionsProps) {
    const isLoading = isSubmitting || isPending;

    return (
        <div className="flex gap-4 justify-end mt-8">
            <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
            >
                {cancelText}
            </Button>

            {!isDetail && (
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitText}
                </Button>
            )}
        </div>
    );
}