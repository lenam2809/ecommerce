"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formUpdatePermissionSchema, UpdatePermissionDto } from '@/schemas/permission/permission-schema';
import { PermissionInfoSection } from './form-sections/permission-info';
import { useUpdatePermission } from '@/hooks/use-permissions';
import { Permission } from '@/types/permission';

interface EditPermissionFormProps {
    permission: Permission;
    isDetail?: boolean;
}

export function EditPermissionForm({ permission, isDetail = false }: EditPermissionFormProps) {
    const router = useRouter();
    const { mutate: updatePermission, isPending } = useUpdatePermission();

    const form = useForm<UpdatePermissionDto>({
        resolver: zodResolver(formUpdatePermissionSchema),
        defaultValues: {
            name: '',
            description: '',
            category: '', // Thêm trường category nếu cần thiết
        },
    });

    // Load dữ liệu quyền hiện tại vào form
    useEffect(() => {
        if (permission) {
            console.log('Initial permission data:', permission);

            // Chuyển đổi dữ liệu từ API vào form values
            const defaultValues = {
                id: permission.id,
                name: permission.name,
                description: permission.description,
                category: permission.category || '', // Nếu có trường category
            };

            console.log('Setting form values:', defaultValues);
            form.reset(defaultValues);
        }
    }, [permission, form]);

    const handleSubmit = async (values: UpdatePermissionDto) => {
        updatePermission(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <PermissionInfoSection form={form} isDetail={isDetail} />
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
                    {!isDetail && (
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Cập nhật
                        </Button>
                    )}


                </div>
            </form>
        </Form>
    );
}