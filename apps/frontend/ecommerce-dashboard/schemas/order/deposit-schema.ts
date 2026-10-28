import { z } from "zod";
import { EDepositStatus } from "@/types/order";

export const updateDepositSchema = z.object({
  depositStatus: z.nativeEnum(EDepositStatus),
  depositAmount: z.number().min(0, "Số tiền cọc không được âm").optional(),
  carrierName: z.string().max(100, "Tên ĐVVC tối đa 100 ký tự").optional().or(z.literal("")),
  trackingNumber: z.string().max(100, "Mã vận đơn tối đa 100 ký tự").optional().or(z.literal("")),
  driverName: z.string().max(100, "Tên tài xế tối đa 100 ký tự").optional().or(z.literal("")),
  driverPhone: z.string().max(20, "SĐT tài xế tối đa 20 ký tự").optional().or(z.literal("")),
});

export type UpdateDepositDto = z.infer<typeof updateDepositSchema>;
