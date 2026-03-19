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
import { CustomerLevel } from '@/types/user';
import { FormSingleSelect } from '@/components/ui/select/form-single-select';

interface CustomerSectionProps {
    form: { control: Control<any> }; // eslint-disable-line @typescript-eslint/no-explicit-any
    isDetail?: boolean;
}

export function CustomerSection({ form, isDetail = false }: CustomerSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormSingleSelect<number>
                    control={form.control}
                    name="customerLevel"
                    label="Cấp độ khách hàng"
                    placeholder="Chọn cấp độ"
                    options={[
                        { value: CustomerLevel.Bronze, label: "Đồng" },
                        { value: CustomerLevel.Silver, label: "Bạc" },
                        { value: CustomerLevel.Gold, label: "Vàng" },
                        { value: CustomerLevel.Diamond, label: "Kim cương" },
                    ]}
                    disabled={isDetail}
                    description='Cấp độ khách hàng xác định quyền lợi và ưu đãi mà khách hàng nhận được'
                />

                <FormField
                    control={form.control}
                    name="promotionPoints"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Điểm thưởng</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    onChange={e => field.onChange(Number(e.target.value))}
                                    disabled={isDetail}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}