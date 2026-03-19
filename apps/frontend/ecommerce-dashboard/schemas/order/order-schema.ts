import { EOrderStatus } from "@/types/order";
import { z } from "zod";

// Define zod schema for form validation
export const formCreateOrderSchema = z.object({
    applicationUserId: z.string().min(1, "Khách hàng là bắt buộc"),
    shippingAddress: z.string().min(1, "Địa chỉ giao hàng là bắt buộc").max(500, "Địa chỉ không quá 500 ký tự"),
    phone: z.string().min(1, "Số điện thoại là bắt buộc"),
    email: z.string().email("Email không hợp lệ"),
    status: z.nativeEnum(EOrderStatus).default(EOrderStatus.Pending).optional(),
    discountCode: z.string().optional(),
    deliveryInstructions: z.string().max(500, "Hướng dẫn giao hàng không quá 500 ký tự").optional(),
    expectedDeliveryDate: z.date().optional(),
    orderItems: z.array(
        z.object({
            productId: z.string().min(1, "Sản phẩm là bắt buộc"),
            quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
            color: z.string().optional(),
            size: z.string().optional()
        })
    ).min(1, "Đơn hàng phải có ít nhất một sản phẩm")
});

// Schema for updating a permission
// Define zod schema for form validation
export const formUpdateOrderSchema = z.object({
    id: z.string().min(1, "ID đơn hàng là bắt buộc"),
    code: z.string().min(1, "Mã đơn hàng là bắt buộc").max(50, "Mã không quá 50 ký tự"),
    applicationUserId: z.string().min(1, "Khách hàng là bắt buộc"),
    shippingAddress: z.string().min(1, "Địa chỉ giao hàng là bắt buộc").max(500, "Địa chỉ không quá 500 ký tự"),
    totalAmount: z.number().min(0, "Tổng tiền phải lớn hơn hoặc bằng 0"),
    phone: z.string().min(1, "Số điện thoại là bắt buộc"),
    email: z.string().email("Email không hợp lệ"),
    status: z.nativeEnum(EOrderStatus).default(EOrderStatus.Pending).optional(),
    discountCode: z.string().optional(),
    deliveryInstructions: z.string().max(500, "Hướng dẫn giao hàng không quá 500 ký tự").optional(),
    expectedDeliveryDate: z.date().optional(),
    orderDate: z.date().optional(),
    orderItems: z.array(
        z.object({
            productId: z.string().min(1, "Sản phẩm là bắt buộc"),
            quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
            color: z.string().optional(),
            size: z.string().optional()
        })
    ).min(1, "Đơn hàng phải có ít nhất một sản phẩm")
});


export type CreateOrderDto = z.infer<typeof formCreateOrderSchema>;
export type UpdateOrderDto = z.infer<typeof formUpdateOrderSchema>;
