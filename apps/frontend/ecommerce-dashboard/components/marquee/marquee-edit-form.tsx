// components/marquee/marquee-edit-form.tsx
"use client";

import { logger } from '@/lib/logger'
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UpdateMarqueeDto, formUpdateMarqueeSchema } from '@/schemas/marquee/marquee-schema';
import { useUpdateMarquee } from '@/hooks/use-marquees';
import { MarqueeMessage } from '@/types/marquee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MarqueeEditFormProps {
    marquee: MarqueeMessage;
    isDetail?: boolean;
}

export function MarqueeEditForm({ marquee, isDetail = false }: MarqueeEditFormProps) {
    const router = useRouter();
    const { mutate: updateMarquee, isPending } = useUpdateMarquee();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<UpdateMarqueeDto>({
        resolver: zodResolver(formUpdateMarqueeSchema),
        defaultValues: {
            id: '',
            content: '',
            priority: 0,
            speed: 50,
            isActive: true,
        },
    });

    useEffect(() => {
        if (marquee) {
            form.reset({
                id: marquee.id,
                content: marquee.content,
                priority: marquee.priority,
                speed: marquee.speed,
                isActive: marquee.isActive,
            });
        }
    }, [marquee, form]);

    const handleSubmit = async (values: UpdateMarqueeDto) => {
        setIsSubmitting(true);
        try {
            updateMarquee(values);
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
                                            disabled={isDetail}
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
                                    <FormLabel>Thứ tự ưu tiên</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            placeholder="0"
                                            disabled={isDetail}
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
                                            disabled={isDetail}
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
                        {isDetail ? 'Quay lại' : 'Hủy'}
                    </Button>
                    {!isDetail && (
                        <Button type="submit" disabled={isSubmitting || isPending}>
                            {(isSubmitting || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Cập nhật
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    );
}
