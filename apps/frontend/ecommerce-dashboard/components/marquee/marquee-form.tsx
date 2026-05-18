// components/marquee/marquee-form.tsx
"use client";

import { logger } from '@/lib/logger'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CreateMarqueeDto, formCreateMarqueeSchema } from '@/schemas/marquee/marquee-schema';
import { useCreateMarquee } from '@/hooks/use-marquees';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MarqueeForm() {
    const router = useRouter();
    const { mutate: createMarquee, isPending } = useCreateMarquee();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CreateMarqueeDto>({
        resolver: zodResolver(formCreateMarqueeSchema),
        defaultValues: {
            content: '',
            priority: 0,
            speed: 50,
            isActive: true,
        },
    });

    const handleSubmit = async (values: CreateMarqueeDto) => {
        setIsSubmitting(true);
        try {
            createMarquee(values);
        } catch (error) {
            logger.error('Error submitting marquee:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin tin nhắn</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nội dung tin nhắn <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Nhập nội dung tin nhắn marquee..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Nội dung sẽ hiển thị trên thanh marquee của trang web. Tối đa 500 ký tự.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Thứ tự hiển thị (Ưu tiên)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            placeholder="0"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Số nhỏ hơn sẽ hiển thị trước. Mặc định là 0.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Kích hoạt</FormLabel>
                                        <FormDescription>
                                            Bật để hiển thị tin nhắn này trên thanh marquee.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex gap-4 justify-end">
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
                        Thêm mới
                    </Button>
                </div>
            </form>
        </Form>
    );
}
