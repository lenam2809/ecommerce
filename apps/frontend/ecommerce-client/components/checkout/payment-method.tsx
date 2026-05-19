import { UseFormReturn } from "react-hook-form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import Image from "next/image"

interface PaymentMethodProps {
    form: UseFormReturn<any>
}

export function PaymentMethod({ form }: PaymentMethodProps) {
    return (
        <div className="bg-card text-card-foreground rounded-lg border border-border/20 overflow-hidden">
            <div className="p-4 bg-muted border-b border-border/20">
                <h3 className="font-medium text-foreground">Phương thức thanh toán</h3>
            </div>

            <div className="p-6">
                <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="space-y-4"
                                >
                                    <FormItem className="flex items-center space-x-2 space-y-0 border rounded-lg p-4">
                                        <FormControl>
                                            <RadioGroupItem value="cod" />
                                        </FormControl>
                                        <Label className="flex items-center cursor-pointer flex-1 font-normal">
                                            <Image
                                                src="/CardImages/cod.png?height=40&width=40"
                                                alt="COD"
                                                width={40}
                                                height={40}
                                                className="mr-3"
                                            // Optional: Add placeholder/blur if needed
                                            />
                                            <div>
                                                <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                                                <div className="text-sm text-muted-foreground">Thanh toán bằng tiền mặt khi nhận hàng</div>
                                            </div>
                                        </Label>
                                    </FormItem>

                                    <FormItem className="flex items-center space-x-2 space-y-0 border rounded-lg p-4">
                                        <FormControl>
                                            <RadioGroupItem value="bank" />
                                        </FormControl>
                                        <Label className="flex items-center cursor-pointer flex-1 font-normal">
                                            <Image
                                                src="/CardImages/bank.png?height=40&width=40"
                                                alt="Bank Transfer"
                                                width={40}
                                                height={40}
                                                className="mr-3"
                                            />
                                            <div>
                                                <div className="font-medium">Chuyển khoản ngân hàng</div>
                                                <div className="text-sm text-muted-foreground">Thanh toán qua chuyển khoản ngân hàng</div>
                                            </div>
                                        </Label>
                                    </FormItem>

                                    <FormItem className="flex items-center space-x-2 space-y-0 border rounded-lg p-4">
                                        <FormControl>
                                            <RadioGroupItem value="momo" />
                                        </FormControl>
                                        <Label className="flex items-center cursor-pointer flex-1 font-normal">
                                            <Image
                                                src="/CardImages/MoMo_Logo.png?height=40&width=40"
                                                alt="Momo"
                                                width={40}
                                                height={40}
                                                className="mr-3"
                                            />
                                            <div>
                                                <div className="font-medium">Ví MoMo</div>
                                                <div className="text-sm text-muted-foreground">Thanh toán qua ví điện tử MoMo</div>
                                            </div>
                                        </Label>
                                    </FormItem>

                                    <FormItem className="flex items-center space-x-2 space-y-0 border rounded-lg p-4">
                                        <FormControl>
                                            <RadioGroupItem value="credit" />
                                        </FormControl>
                                        <Label className="flex items-center cursor-pointer flex-1 font-normal">
                                            <Image
                                                src="/CardImages/CreditCard.png?height=40&width=40"
                                                alt="Credit Card"
                                                width={40}
                                                height={40}
                                                className="mr-3"
                                            />
                                            <div>
                                                <div className="font-medium">Thẻ tín dụng/Ghi nợ</div>
                                                <div className="text-sm text-muted-foreground">Thanh toán bằng thẻ Visa, Mastercard, JCB</div>
                                            </div>
                                        </Label>
                                    </FormItem>

                                    <FormItem className="flex items-center space-x-2 space-y-0 border rounded-lg p-4">
                                        <FormControl>
                                            <RadioGroupItem value="vnpay" />
                                        </FormControl>
                                        <Label className="flex items-center cursor-pointer flex-1 font-normal">
                                            <Image
                                                src="/CardImages/vnpay.png" // We might need to add this image or use a placeholder
                                                alt="VNPay"
                                                width={40}
                                                height={40}
                                                className="mr-3"
                                            />
                                            <div>
                                                <div className="font-medium">VNPay Sandbox</div>
                                                <div className="text-sm text-muted-foreground">Thanh toán qua ví VNPay (Môi trường Test)</div>
                                            </div>
                                        </Label>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}
