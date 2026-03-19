"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCreateUser } from '@/hooks/use-users';
import { FormCreateUserSchema, formCreateUserSchema } from '@/schemas/user';
import { BasicInfoSection } from './form-sections/basic-info';
import { RoleSection } from './form-sections/role';
import { CustomerSection } from './form-sections/customer';
import { PasswordSection } from './form-sections/password';
import { AvatarUploadSection } from './form-sections/avatar-upload';
import { CustomerLevel, UserRole, UserStatus } from '@/types/user';
import { toast } from '@/hooks/use-toast';


export function UserForm() {
    const router = useRouter();
    const { mutate: createUser, isPending } = useCreateUser();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormCreateUserSchema>({
        resolver: zodResolver(formCreateUserSchema),
        defaultValues: {
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            role: UserRole.Customer,
            phoneNumber: '',
            customerLevel: CustomerLevel.Bronze,
            promotionPoints: 0,
            status: UserStatus.Active
        },
    });

    const onSubmit = async (values: FormCreateUserSchema) => {
        setIsSubmitting(true);

        try {
            createUser(values);
            // Navigation xử lý trong onSuccess của hook
        } catch (error) {
            console.error('Error creating user:', error);
            toast({
                title: "Thêm mới người dùng",
                description: `Có lỗi xảy ra trong quá trình tạo người dùng ${values.firstName} ${values.lastName}`,
                variant: "destructive",
            })
        }
        finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <BasicInfoSection form={form} />
                <PasswordSection form={form} />
                <RoleSection form={form} />
                <AvatarUploadSection form={form} />
                <CustomerSection form={form} />

                <div className="flex gap-4 justify-end mt-8">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting || isPending}
                    >
                        Hủy
                    </Button>

                    <Button type="submit" disabled={isSubmitting || isPending}>
                        {(isSubmitting || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Thêm người dùng
                    </Button>
                </div>
            </form>
        </Form>
    );
}