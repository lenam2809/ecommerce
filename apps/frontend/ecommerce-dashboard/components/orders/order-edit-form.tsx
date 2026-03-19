"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { OrderInfoSection } from "./form-sections/order-info";
import { ShippingSection } from "./form-sections/shipping";
import { OrderItemsSection } from "./form-sections/order-items";
import { useUpdateOrder } from "@/hooks/use-orders";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { EOrderStatus, Order } from "@/types/order";
import { formUpdateOrderSchema, UpdateOrderDto } from "@/schemas/order/order-schema";
import { OrderHistoryComponent } from "./order-history";

interface OrderEditFormProps {
  order: Order;
  isDetail?: boolean;
}

export function OrderEditForm({ order, isDetail = false }: OrderEditFormProps) {
  const router = useRouter();
  const { mutate: updateOrder, isPending } = useUpdateOrder();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateOrderDto>({
    resolver: zodResolver(formUpdateOrderSchema),
    defaultValues: {
      id: "",
      code: "",
      applicationUserId: "",
      totalAmount: 0,
      orderDate: new Date(),
      shippingAddress: "",
      phone: "",
      email: "",
      status: EOrderStatus.Pending,
      discountCode: "",
      deliveryInstructions: "",
      expectedDeliveryDate: undefined,
      orderItems: [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!order) return;

    const defaultValues: UpdateOrderDto = {
      id: order.id,
      code: order.code,
      applicationUserId: order.applicationUserId,
      totalAmount: order.totalAmount,
      orderDate: new Date(order.orderDate),
      shippingAddress: order.shippingAddress,
      phone: order.phone,
      email: order.email,
      status: order.status,
      discountCode: order.discountCode || "",
      deliveryInstructions: order.deliveryInstructions || "",
      expectedDeliveryDate: order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate) : undefined,
      orderItems: order.orderItems || [],
    };

    form.reset(defaultValues);
  }, [order, form]);

  const onSubmit = async (values: UpdateOrderDto) => {
    setIsSubmitting(true);

    try {
      updateOrder(values);
      // Điều hướng được xử lý trong onSuccess của hook
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <OrderInfoSection form={form} isEditing isDetail={isDetail} />
        <ShippingSection form={form} isEditing isDetail={isDetail} />
        <OrderItemsSection form={form} isEditing isDetail={isDetail} />
        <OrderHistoryComponent orderId={order.id} />

        <div className="mt-8 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isBusy}
          >
            Huỷ
          </Button>

          {!isDetail && (
            <Button type="submit" disabled={isBusy}>
              {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cập nhật đơn hàng
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
