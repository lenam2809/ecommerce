"use client";

import { useState } from "react";
import { Order } from "@/types/order";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUploadInvoicePdf } from "@/hooks/use-orders";
import {
  FileText,
  Upload,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Building2,
  Mail,
  MapPin,
  FileCheck,
  Edit,
} from "lucide-react";

interface OrderInvoiceCardProps {
  order: Order;
  isReadOnly?: boolean;
}

export function OrderInvoiceCard({ order, isReadOnly = false }: OrderInvoiceCardProps) {
  const [open, setOpen] = useState(false);
  const { mutate: uploadInvoice, isPending } = useUploadInvoicePdf();

  const invoice = order.invoice;
  const hasInvoiceRequired = invoice?.requireInvoice || !!invoice?.taxCode || !!invoice?.companyName;
  const hasUploadedFile = !!invoice?.invoiceFileUrl;

  // Local form state
  const [taxCode, setTaxCode] = useState(invoice?.taxCode || "");
  const [companyName, setCompanyName] = useState(invoice?.companyName || "");
  const [companyAddress, setCompanyAddress] = useState(invoice?.companyAddress || "");
  const [invoiceEmail, setInvoiceEmail] = useState(invoice?.invoiceEmail || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleOpenDialog = () => {
    setTaxCode(invoice?.taxCode || "");
    setCompanyName(invoice?.companyName || "");
    setCompanyAddress(invoice?.companyAddress || "");
    setInvoiceEmail(invoice?.invoiceEmail || "");
    setSelectedFile(null);
    setFileError(null);
    setOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setFileError("Chỉ chấp nhận file định dạng PDF (.pdf)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError("Dung lượng file không được vượt quá 10MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFileError(null);

    const formData = new FormData();
    if (selectedFile) {
      formData.append("file", selectedFile);
    }
    if (taxCode.trim()) formData.append("taxCode", taxCode.trim());
    if (companyName.trim()) formData.append("companyName", companyName.trim());
    if (companyAddress.trim()) formData.append("companyAddress", companyAddress.trim());
    if (invoiceEmail.trim()) formData.append("invoiceEmail", invoiceEmail.trim());

    uploadInvoice(
      {
        orderId: order.id,
        formData,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setSelectedFile(null);
        },
      }
    );
  };

  return (
    <Card className="border-line bg-card shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <FileText className="h-4 w-4 text-tech-blue" />
            Hóa đơn Điện tử VAT Doanh nghiệp
          </CardTitle>
          <CardDescription>
            Tiếp nhận thông tin xuất VAT và upload file PDF hóa đơn từ phần mềm kế toán.
          </CardDescription>
        </div>

        {!isReadOnly && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenDialog}
                className="border-line hover:bg-surface text-foreground"
              >
                <Edit className="mr-1.5 h-3.5 w-3.5 text-tech-blue" />
                {hasUploadedFile ? "Cập nhật / Thay hóa đơn" : "Upload Hóa đơn VAT"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Quản lý Hóa đơn VAT & Upload File PDF</DialogTitle>
                  <DialogDescription>
                    Nhập thông tin xuất VAT và đính kèm file PDF hóa đơn điện tử cho đơn hàng {order.code}.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3.5 py-4 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="taxCode">Mã số thuế</Label>
                      <Input
                        id="taxCode"
                        placeholder="Ví dụ: 0312345678"
                        value={taxCode}
                        onChange={(e) => setTaxCode(e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="invoiceEmail">Email nhận hóa đơn</Label>
                      <Input
                        id="invoiceEmail"
                        type="email"
                        placeholder="ketoan@congty.com"
                        value={invoiceEmail}
                        onChange={(e) => setInvoiceEmail(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="companyName">Tên công ty / Doanh nghiệp</Label>
                    <Input
                      id="companyName"
                      placeholder="Công ty TNHH Giải Pháp Công Nghệ..."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="companyAddress">Địa chỉ doanh nghiệp</Label>
                    <Input
                      id="companyAddress"
                      placeholder="Số 123 Đường ABC, Phường X, Quận Y, TP.HCM"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  {/* Khu vực upload PDF */}
                  <div className="space-y-1.5 border-t border-line pt-3">
                    <Label htmlFor="pdfFile">File PDF Hóa đơn VAT (Tối đa 10MB)</Label>
                    <div className="rounded-lg border-2 border-dashed border-line hover:border-tech-blue/50 p-4 text-center cursor-pointer transition-colors bg-surface/20">
                      <input
                        id="pdfFile"
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="pdfFile" className="cursor-pointer space-y-1 block">
                        <Upload className="mx-auto h-6 w-6 text-tech-blue" />
                        <div className="text-xs font-medium text-foreground">
                          {selectedFile ? selectedFile.name : "Bấm để chọn file PDF hoặc kéo thả vào đây"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Định dạng .pdf, dung lượng tối đa 10MB
                        </div>
                      </label>
                    </div>

                    {fileError && (
                      <div className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {fileError}
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isPending}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isPending} className="bg-tech-blue text-white hover:bg-tech-blue/90">
                    {isPending ? "Đang upload..." : "Lưu hóa đơn"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {hasInvoiceRequired ? (
          <div className="rounded-lg border border-line bg-surface/30 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Building2 className="h-4 w-4 text-tech-blue" />
                <span>{invoice?.companyName || "Chưa có tên công ty"}</span>
              </div>
              {hasUploadedFile ? (
                <Badge className="bg-emerald-600/15 text-emerald-600 border-emerald-500/20 text-xs py-0.5">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  Đã có file PDF
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 border-amber-500/20 bg-amber-50/50 text-xs py-0.5">
                  <AlertCircle className="mr-1 h-3.5 w-3.5" />
                  Chờ kế toán upload file
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground block">Mã số thuế:</span>
                <span className="font-mono font-medium text-foreground">{invoice?.taxCode || "N/A"}</span>
              </div>

              <div>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email nhận hóa đơn:
                </span>
                <span className="font-medium text-foreground">{invoice?.invoiceEmail || "N/A"}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Địa chỉ doanh nghiệp:
                </span>
                <span className="text-foreground">{invoice?.companyAddress || "N/A"}</span>
              </div>
            </div>

            {hasUploadedFile && (
              <div className="pt-2 border-t border-line/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  <span>File hóa đơn VAT đã upload</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="h-8 text-xs border-line hover:bg-surface text-tech-blue"
                >
                  <a href={invoice?.invoiceFileUrl || "#"} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Xem / Tải PDF Hóa đơn
                  </a>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-line bg-surface/20 p-4 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Khách hàng không tích chọn yêu cầu xuất hóa đơn VAT khi đặt hàng.
            </p>
            {!isReadOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenDialog}
                className="text-xs border-line hover:bg-surface text-tech-blue"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Bổ sung thông tin & Upload hóa đơn
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
