import { z } from "zod";

export const assignSerialSchema = z.object({
  serialNumber: z.string().min(1, "Mã Serial/IMEI không được để trống").max(100, "Tối đa 100 ký tự"),
  imei: z.string().max(50, "Tối đa 50 ký tự").optional().or(z.literal("")),
  warrantyMonths: z.number().int().min(1, "Tối thiểu 1 tháng").default(24).optional(),
});

export type AssignSerialDto = z.infer<typeof assignSerialSchema>;
