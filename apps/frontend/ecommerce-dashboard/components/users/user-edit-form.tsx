"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUpdateUser } from '@/hooks/use-users';
import { FormUpdateUserSchema, formUpdateUserSchema } from '@/schemas/user';
import { BasicInfoSection } from './form-sections/basic-info';
import { RoleSection } from './form-sections/role';
import { CustomerSection } from './form-sections/customer';
import { AvatarUploadSection } from './form-sections/avatar-upload';
import { StatusSection } from './form-sections/status';
import { CustomerLevel, User, UserRole, UserStatus } from '@/types/user';


interface UserEditFormProps {
    user: User;
    isDetail?: boolean;
}

export function UserEditForm({ user, isDetail = false }: UserEditFormProps) {
    const router = useRouter();
    const { mutate: updateUser, isPending } = useUpdateUser();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormUpdateUserSchema>({
        resolver: zodResolver(formUpdateUserSchema),
        defaultValues: {
            id: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            customerLevel: CustomerLevel.Bronze,
            promotionPoints: 0,
            status: UserStatus.Active,
        },
        mode: 'onChange'
    });

    // Load dữ liệu người dùng hiện tại vào form
    useEffect(() => {
        if (user) {
            console.log('Initial user data:', user);

            // Chuyển đổi dữ liệu từ API vào form values
            const defaultValues: FormUpdateUserSchema = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber || '',
                customerLevel: user.customerLevel as CustomerLevel,
                promotionPoints: user.promotionPoints || 0,
                status: user.status as UserStatus,
                roles: user.roles?.[0] as UserRole, // Get the first item in roles array or fallback to an empty string
                avatar: user.avatar as string, // Assuming avatarUrl is a string
            };

            console.log('Setting form values:', defaultValues);
            form.reset(defaultValues);
        }
    }, [user, form]);

    const onSubmit = async (values: FormUpdateUserSchema) => {
        setIsSubmitting(true);

        try {
            updateUser(values);
            // Navigation xử lý trong onSuccess của hook
        } catch (error) {
            console.error('Error updating user:', error);
        }
        finally {
            setIsSubmitting(false);
        }


    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <BasicInfoSection form={form} isEditing={true} isDetail={isDetail} />
                <RoleSection form={form} isDetail={isDetail} />
                <AvatarUploadSection form={form} isEditing={true} isDetail={isDetail} />
                <CustomerSection form={form} isDetail={isDetail} />
                <StatusSection form={form} isDetail={isDetail} />

                <div className="flex gap-4 justify-end mt-8">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting || isPending}
                    >
                        Hủy
                    </Button>

                    {!isDetail && (
                        <Button type="submit" disabled={isSubmitting || isPending}>
                            {(isSubmitting || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Cập nhật người dùng
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    );
}