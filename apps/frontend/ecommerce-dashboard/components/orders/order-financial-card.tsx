"use client";

import { useState } from "react";
import { Order, EDepositStatus } from "@/types/order";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateDepositStatus } from "@/hooks/use-orders";
import { CreditCard, Truck, AlertCircle, CheckCircle2, Clock, RotateCcw, Edit } from "lucide-react";

interface OrderFinancialCardProps {
  order: Order;
  isReadOnly?: boolean;
}

export function OrderFinancialCard({ order, isReadOnly = false }: OrderFinancialCardProps) {
  const [open, setOpen] = useState(false);
  const { mutate: updateDeposit, isPending } = useUpdateDepositStatus();

  // Local form state for deposit & shipping dialog
  const [depositStatus, setDepositStatus] = useState<EDepositStatus>(
    order.depositStatus ?? EDepositStatus.None
  );
  const [depositAmount, setDepositAmount] = useState<number>(
    order.depositAmount ?? 0
  );
  const [carrierName, setCarrierName] = useState<string>(order.carrierName || "");
  const [trackingNumber, setTrackingNumber] = useState<string>(order.trackingNumber || "");
  const [driverName, setDriverName] = useState<string>(order.driverName || "");
  const [driverPhone, setDriverPhone] = useState<string>(order.driverPhone || "");

  const formatVnd = (value: number) => {
    return `${Math.round(value).toLocaleString("vi-VN")}₫`;
  };

  const calculatedSubtotal = order.subtotal && order.subtotal > 0
    ? order.subtotal
    : Math.max(0, order.totalAmount - (order.shippingCost || 0) + (order.discountAmount || 0));

  const isFreeshipEligible = calculatedSubtotal >= 500_000;
  const isHighValueCod = order.totalAmount > 20_000_000;
  const requiredDeposit: number = (order.depositRequired ?? 0) > 0
    ? (order.depositRequired ?? 0)
    : (isHighValueCod ? Math.round(order.totalAmount * 0.1) : 0);
  const actualDeposit: number = order.depositAmount ?? 0;
  const remainingAmount = order.remainingAmount ?? Math.max(0, order.totalAmount - actualDeposit);

  const handleOpenDialog = () => {
    setDepositStatus(order.depositStatus ?? EDepositStatus.None);
    setDepositAmount(order.depositAmount ?? (isHighValueCod && order.depositStatus === EDepositStatus.Paid ? requiredDeposit : 0));
    setCarrierName(order.carrierName || "");
    setTrackingNumber(order.trackingNumber || "");
    setDriverName(order.driverName || "");
    setDriverPhone(order.driverPhone || "");
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeposit(
      {
        orderId: order.id,
        depositStatus,
        depositAmount: Number(depositAmount),
        carrierName: carrierName.trim() || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
        driverName: driverName.trim() || undefined,
        driverPhone: driverPhone.trim() || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  const renderDepositStatusBadge = (status: EDepositStatus) => {
    switch (status) {
      case EDepositStatus.Paid:
        return (
          <Badge className="bg-emerald-600/15 text-emerald-600 hover:bg-emerald-600/25 border-emerald-500/20">
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            Đã thanh toán cọc 10%
          </Badge>
        );
      case EDepositStatus.Pending:
        return (
          <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-amber-500/20">
            <Clock className="mr-1 h-3.5 w-3.5" />
            Chờ khách đặt cọc
          </Badge>
        );
      case EDepositStatus.Refunded:
        return (
          <Badge className="bg-purple-500/15 text-purple-600 hover:bg-purple-500/25 border-purple-500/20">
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Đã hoàn trả cọc
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Không áp dụng cọc
          </Badge>
        );
    }
  };

  return (
    <Card className="border-line bg-card shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <CreditCard className="h-4 w-4 text-tech-blue" />
            Tài chính, Đặt cọc & Vận đơn
          </CardTitle>
          <CardDescription>
            Quy chuẩn SSoT 2026: Freeship từ 500k, Đặt cọc COD 10% cho đơn &gt; 20tr
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
                Cập nhật cọc & vận đơn
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Cập nhật trạng thái cọc & Thông tin vận đơn</DialogTitle>
                  <DialogDescription>
                    Cập nhật tiến trình đặt cọc 10% và tài xế / đơn vị vận chuyển cho đơn hàng {order.code}.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="depositStatus">Trạng thái cọc</Label>
                      <Select
                        value={String(depositStatus)}
                        onValueChange={(val) => {
                          const statusNum = Number(val) as EDepositStatus;
                          setDepositStatus(statusNum);
                          if (statusNum === EDepositStatus.Paid && depositAmount === 0 && requiredDeposit > 0) {
                            setDepositAmount(requiredDeposit);
                          } else if (statusNum === EDepositStatus.None) {
                            setDepositAmount(0);
                          }
                        }}
                      >
                        <SelectTrigger id="depositStatus">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={String(EDepositStatus.None)}>Không áp dụng</SelectItem>
                          <SelectItem value={String(EDepositStatus.Pending)}>Chờ đặt cọc</SelectItem>
                          <SelectItem value={String(EDepositStatus.Paid)}>Đã thanh toán cọc</SelectItem>
                          <SelectItem value={String(EDepositStatus.Refunded)}>Đã hoàn cọc</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="depositAmount">Số tiền cọc (₫)</Label>
                      <Input
                        id="depositAmount"
                        type="number"
                        min="0"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(Number(e.target.value))}
                        className="font-mono tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="border-t border-line pt-3 space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Thông tin vận đơn & Tài xế
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="carrierName">Đơn vị vận chuyển</Label>
                        <Input
                          id="carrierName"
                          placeholder="Ví dụ: Giao Hàng Nhanh, Viettel Post..."
                          value={carrierName}
                          onChange={(e) => setCarrierName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="trackingNumber">Mã vận đơn</Label>
                        <Input
                          id="trackingNumber"
                          placeholder="Ví dụ: GHN-8934521"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="driverName">Tên tài xế</Label>
                        <Input
                          id="driverName"
                          placeholder="Nguyễn Văn A"
                          value={driverName}
                          onChange={(e) => setDriverName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="driverPhone">SĐT tài xế</Label>
                        <Input
                          id="driverPhone"
                          placeholder="0912 345 678"
                          value={driverPhone}
                          onChange={(e) => setDriverPhone(e.target.value)}
                        />
                      </div>
                    </div>
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
                    {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bảng tính toán tài chính */}
        <div className="rounded-lg bg-surface/50 border border-line p-3.5 space-y-2 text-sm">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Tạm tính tiền hàng:</span>
            <span className="price-tag font-medium text-foreground">{formatVnd(calculatedSubtotal)}</span>
          </div>

          <div className="flex justify-between items-center text-muted-foreground">
            <span className="flex items-center gap-1.5">
              Phí vận chuyển:
              {isFreeshipEligible ? (
                <Badge variant="outline" className="text-[11px] h-5 px-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-50/50">
                  Freeship 500k
                </Badge>
              ) : (
                <span className="text-[11px] text-muted-foreground">(Dưới 500k: 30.000₫)</span>
              )}
            </span>
            <span className="price-tag font-medium text-foreground">
              {order.shippingCost && order.shippingCost > 0 ? formatVnd(order.shippingCost) : "Miễn phí"}
            </span>
          </div>

          {order.discountAmount && order.discountAmount > 0 ? (
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Giảm giá khuyến mãi:</span>
              <span className="price-tag font-medium text-brand">-{formatVnd(order.discountAmount)}</span>
            </div>
          ) : null}

          <div className="border-t border-line pt-2 flex justify-between items-center">
            <span className="font-semibold text-foreground text-base">Tổng giá trị đơn hàng:</span>
            <span className="price-tag text-lg font-bold text-brand">{formatVnd(order.totalAmount)}</span>
          </div>
        </div>

        {/* Khối Cọc COD 10% */}
        {(isHighValueCod || requiredDeposit > 0 || (order.depositAmount ?? 0) > 0 || (order.depositStatus ?? EDepositStatus.None) !== EDepositStatus.None) && (
          <div className="rounded-lg border border-line bg-card p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-tech-blue" />
                <span className="font-semibold text-foreground text-sm">Chính sách Cọc COD 10%</span>
              </div>
              <div>{renderDepositStatusBadge(order.depositStatus ?? EDepositStatus.None)}</div>
            </div>

            <p className="text-xs text-muted-foreground">
              {isHighValueCod
                ? "Đơn hàng trên 20.000.000₫ áp dụng quy định đặt cọc trước 10% giá trị đơn hàng khi thanh toán COD."
                : "Thông tin ghi nhận tiền cọc của đơn hàng."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-line/60">
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground">Mức cọc yêu cầu (10%):</span>
                <div className="price-tag font-semibold text-foreground">{formatVnd(requiredDeposit)}</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground">Tiền cọc thực thu:</span>
                <div className="price-tag font-semibold text-tech-blue">{formatVnd(actualDeposit)}</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground">Còn phải thu khi giao:</span>
                <div className="price-tag font-bold text-brand">{formatVnd(remainingAmount)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Khối Thông tin Vận chuyển & Vận đơn */}
        <div className="rounded-lg border border-line bg-card p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Truck className="h-4 w-4 text-tech-blue" />
            Phương thức & Thông tin Vận chuyển
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
            <div>
              <span className="text-muted-foreground block">Phương thức:</span>
              <span className="font-medium text-foreground">
                {order.showroomName ? `Nhận tại Showroom (${order.showroomName})` : "Giao hàng tận nơi"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Đơn vị vận chuyển:</span>
              <span className="font-medium text-foreground">{order.carrierName || "Chưa gán"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Mã vận đơn:</span>
              <span className="font-mono text-foreground font-medium">{order.trackingNumber || "Chưa có"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Tài xế / SĐT:</span>
              <span className="font-medium text-foreground">
                {order.driverName ? `${order.driverName} (${order.driverPhone || "N/A"})` : "Chưa có"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
