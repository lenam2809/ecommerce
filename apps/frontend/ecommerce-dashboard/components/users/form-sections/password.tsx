// src/components/users/form-sections/password.tsx
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
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // Import eye icons from Lucide
import { Button } from '@/components/ui/button'; // Import Button component

interface PasswordSectionProps {
    form: { control: Control<any> }; // eslint-disable-line @typescript-eslint/no-explicit-any
    isDetail?: boolean;
}

export function PasswordSection({ form, isDetail = false }: PasswordSectionProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mật khẩu</CardTitle>
            </CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mật khẩu</FormLabel>
                            <div className="relative">
                                <FormControl>
                                    <Input
                                        {...field}
                                        type={showPassword ? 'text' : 'password'}
                                        disabled={isDetail}
                                    />
                                </FormControl>
                                {!isDetail && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                        <span className="sr-only">
                                            {showPassword ? 'Hide password' : 'Show password'}
                                        </span>
                                    </Button>
                                )}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}