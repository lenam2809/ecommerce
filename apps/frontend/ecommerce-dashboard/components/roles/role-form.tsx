// components/roles/role-form.tsx
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CreateRoleDto, formCreateRoleSchema } from '@/schemas/role/role-schema';
import { RoleInfoSection } from './form-sections/role-info';
import { RolePermissionsSection } from './form-sections/role-permissions';
import { useCreateRole } from '@/hooks/use-roles';

export function RoleForm() {
    const router = useRouter();
    const { mutate: createRole, isPending } = useCreateRole();

    const form = useForm<CreateRoleDto>({
        resolver: zodResolver(formCreateRoleSchema),
        defaultValues: {
            name: '',
            permissions: [],
        },
    });

    const handleSubmit = async (values: CreateRoleDto) => {
        createRole(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <RoleInfoSection form={form} />
                    <RolePermissionsSection form={form} />
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