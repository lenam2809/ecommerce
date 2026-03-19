"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { OrderInfoSection } from "./form-sections/order-info";
import { ShippingSection } from "./form-sections/shipping";
import { OrderItemsSection } from "./form-sections/order-items";
import { useCreateOrder } from "@/hooks/use-orders";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreateOrderDto, formCreateOrderSchema } from "@/schemas/order/order-schema";
import { EOrderStatus } from "@/types/order";

export function OrderForm() {
  const router = useRouter();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateOrderDto>({
    resolver: zodResolver(formCreateOrderSchema),
    defaultValues: {
      applicationUserId: "",
      shippingAddress: "",
      phone: "",
      email: "",
      status: EOrderStatus.Pending,
      discountCode: "",
      deliveryInstructions: "",
      expectedDeliveryDate: undefined,
      orderItems: [
        {
          productId: "",
          quantity: 1,
          color: "",
          size: "",
        },
      ],
    },
  });

  const onSubmit = async (values: CreateOrderDto) => {
    setIsSubmitting(true);

    try {
      createOrder(values);
      // Điều hướng được xử lý trong onSuccess của hook
    } catch (error) {
      console.error("Error submitting order form:", error);
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <OrderInfoSection form={form} />
        <ShippingSection form={form} />
        <OrderItemsSection form={form} />

        <div className="mt-8 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isBusy}
          >
            Huỷ
          </Button>

          <Button type="submit" disabled={isBusy}>
            {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tạo đơn hàng
          </Button>
        </div>
      </form>
    </Form>
  );
}
