// src/components/users/form-sections/basic-info.tsx
import { Control } from 'react-hook-form';
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BasicInfoSectionProps {
    form: { control: Control<any> }; // eslint-disable-line @typescript-eslint/no-explicit-any
    isEditing?: boolean;
    isDetail?: boolean;
}

export function BasicInfoSection({ form, isEditing = false, isDetail = false }: BasicInfoSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên</FormLabel>
                            <FormControl>
                                <Input {...field} disabled={isDetail} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Họ</FormLabel>
                            <FormControl>
                                <Input {...field} disabled={isDetail} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {!isEditing && (
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} type="email" disabled={isDetail} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Số điện thoại</FormLabel>
                            <FormControl>
                                <Input {...field} disabled={isDetail} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}