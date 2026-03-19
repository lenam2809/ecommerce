// components/roles/role-edit-form.tsx
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UpdateRoleDto, formUpdateRoleSchema } from '@/schemas/role/role-schema';
import { RoleInfoSection } from './form-sections/role-info';
import { RolePermissionsSection } from './form-sections/role-permissions';
import { useUpdateRole } from '@/hooks/use-roles';
import { Role } from '@/types/role';

interface RoleEditFormProps {
    role: Role;
    isDetail?: boolean;
}

export function RoleEditForm({ role, isDetail = false }: RoleEditFormProps) {
    const router = useRouter();
    const { mutate: updateRole, isPending } = useUpdateRole();

    const form = useForm<UpdateRoleDto>({
        resolver: zodResolver(formUpdateRoleSchema),
        defaultValues: {
            name: '',
            permissions: [],
        },
    });

    useEffect(() => {
        if (role) {
            form.reset({
                id: role.id,
                name: role.name,
                permissions: role.permissions || [],
            });
        }
    }, [role, form]);

    const handleSubmit = async (values: UpdateRoleDto) => {
        updateRole(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <RoleInfoSection form={form} isDetail={isDetail} />
                    <RolePermissionsSection form={form} isDetail={isDetail} />
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
                        Cập nhật
                    </Button>
                </div>
            </form>
        </Form>
    );
}