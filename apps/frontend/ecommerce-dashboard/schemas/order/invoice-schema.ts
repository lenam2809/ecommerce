import { z } from "zod";

export const invoiceUploadSchema = z.object({
  taxCode: z.string().max(50, "Mã số thuế tối đa 50 ký tự").optional().or(z.literal("")),
  companyName: z.string().max(255, "Tên công ty tối đa 255 ký tự").optional().or(z.literal("")),
  companyAddress: z.string().max(500, "Địa chỉ tối đa 500 ký tự").optional().or(z.literal("")),
  invoiceEmail: z.string().email("Email nhận HĐ không hợp lệ").optional().or(z.literal("")),
});

export type InvoiceUploadDto = z.infer<typeof invoiceUploadSchema>;
