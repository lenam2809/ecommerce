// components/permissions/permission-form.tsx
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CreatePermissionDto, formCreatePermissionSchema } from '@/schemas/permission/permission-schema';
import { PermissionInfoSection } from './form-sections/permission-info';
import { useCreatePermission } from '@/hooks/use-permissions';

export function PermissionForm() {
    const router = useRouter();
    const { mutate: createPermission, isPending } = useCreatePermission();

    const form = useForm<CreatePermissionDto>({
        resolver: zodResolver(formCreatePermissionSchema),
        defaultValues: {
            name: '',
            description: '',
            category: '', // Thêm trường category nếu cần thiết
        },
    });

    const handleSubmit = async (values: CreatePermissionDto) => {
        createPermission(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <PermissionInfoSection form={form} />
                </div>

                <div className="flex gap-4 justify-end mt-8">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isPending}
                    >
                        Hủy
                    </Button>

                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Thêm mới
                    </Button>
                </div>
            </form>
        </Form>
    );
}