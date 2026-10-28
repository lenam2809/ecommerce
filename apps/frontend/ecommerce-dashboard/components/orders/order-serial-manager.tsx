"use client";

import { useState } from "react";
import Image from "next/image";
import { Order, OrderItem } from "@/types/order";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAssignItemSerial, useRemoveSerial, useActivateWarranty } from "@/hooks/use-orders";
import {
  QrCode,
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";

interface OrderSerialManagerProps {
  order: Order;
  isReadOnly?: boolean;
}

export function OrderSerialManager({ order, isReadOnly = false }: OrderSerialManagerProps) {
  const { mutate: assignSerial, isPending: isAssigning } = useAssignItemSerial();
  const { mutate: removeSerial, isPending: isRemoving } = useRemoveSerial();
  const { mutate: activateWarranty, isPending: isActivating } = useActivateWarranty();

  // Track barcode input per order item id
  const [inputs, setInputs] = useState<Record<string, { serialNumber: string; imei: string }>>({});

  const handleInputChange = (orderItemId: string, field: "serialNumber" | "imei", value: string) => {
    setInputs((prev) => ({
      ...prev,
      [orderItemId]: {
        serialNumber: field === "serialNumber" ? value : prev[orderItemId]?.serialNumber || "",
        imei: field === "imei" ? value : prev[orderItemId]?.imei || "",
      },
    }));
  };

  const handleQuickAdd = (item: OrderItem) => {
    const currentInput = inputs[item.id];
    if (!currentInput?.serialNumber || !currentInput.serialNumber.trim()) return;

    assignSerial(
      {
        orderId: order.id,
        orderItemId: item.id,
        serialNumber: currentInput.serialNumber.trim(),
        imei: currentInput.imei?.trim() || undefined,
        warrantyMonths: item.warrantyMonths || 24,
      },
      {
        onSuccess: () => {
          setInputs((prev) => ({
            ...prev,
            [item.id]: { serialNumber: "", imei: "" },
          }));
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, item: OrderItem) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleQuickAdd(item);
    }
  };

  const handleRemove = (serialId: string) => {
    removeSerial({
      orderId: order.id,
      serialId,
    });
  };

  const handleActivateAll = () => {
    activateWarranty({
      orderId: order.id,
    });
  };

  const handleActivateItem = (orderItemId: string) => {
    activateWarranty({
      orderId: order.id,
      orderItemId,
    });
  };

  const formatVnd = (value: number) => {
    return `${Math.round(value).toLocaleString("vi-VN")}₫`;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Chưa kích hoạt";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Check if any serial is active
  const allSerials = order.orderItems.flatMap((i) => i.assignedSerials || []);
  const hasActiveWarranty = allSerials.some((s) => s.warrantyStatus === "Active");
  const hasSerialsToActivate = allSerials.some((s) => s.warrantyStatus !== "Active");

  return (
    <Card className="border-line bg-card shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <QrCode className="h-4 w-4 text-tech-blue" />
            Đóng gói Xuất kho: Quét Serial/IMEI & Kích hoạt e-Warranty 24T
          </CardTitle>
          <CardDescription>
            Thao tác độc lập, không khóa chuyển trạng thái đơn. Kích hoạt bảo hành điện tử chính hãng 24 tháng (+ gói mở rộng nếu có).
          </CardDescription>
        </div>
        {!isReadOnly && allSerials.length > 0 && (
          <Button
            size="sm"
            onClick={handleActivateAll}
            disabled={isActivating || !hasSerialsToActivate}
            className="bg-tech-blue text-white hover:bg-tech-blue/90"
          >
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            {isActivating ? "Đang kích hoạt..." : "Kích hoạt e-Warranty toàn đơn"}
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {order.orderItems.map((item, index) => {
          const itemSerials = item.assignedSerials || [];
          const itemInput = inputs[item.id] || { serialNumber: "", imei: "" };
          const isItemWarrantyActive = itemSerials.some((s) => s.warrantyStatus === "Active");
          const totalAssigned = itemSerials.length;
          const isQuantityMet = totalAssigned >= item.quantity;

          return (
            <div
              key={item.id || index}
              className="rounded-lg border border-line bg-surface/30 p-4 space-y-4"
            >
              {/* Thông tin dòng sản phẩm */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {item.image ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-line bg-background">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      No img
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <div className="font-medium text-foreground text-sm flex items-center gap-2">
                      <span>{item.name}</span>
                      {item.skuCode && (
                        <Badge variant="outline" className="text-[11px] font-mono">
                          {item.skuCode}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-2 items-center">
                      <span>Số lượng: <strong className="text-foreground">{item.quantity}</strong></span>
                      {item.variantInfo && <span>• {item.variantInfo}</span>}
                      {item.color && <span>• Màu: {item.color}</span>}
                      {item.size && <span>• Size: {item.size}</span>}
                      <span>• Đơn giá: <span className="price-tag font-semibold text-foreground">{formatVnd(item.unitPrice)}</span></span>
                    </div>
                  </div>
                </div>

                {/* Gói AddOn và Thời hạn bảo hành */}
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                  {item.addOnName && (
                    <Badge variant="outline" className="border-tech-blue/30 text-tech-blue bg-tech-blue/5 text-xs py-0.5">
                      <Sparkles className="mr-1 h-3 w-3" />
                      {item.addOnName} (+{formatVnd(item.addOnPrice || 0)})
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-50/50 text-xs py-0.5">
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    Bảo hành {item.warrantyMonths || 24} tháng
                  </Badge>
                </div>
              </div>

              {/* Danh sách Serial/IMEI đã gán */}
              <div className="space-y-2 border-t border-line/60 pt-3">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    Mã Serial / IMEI đã gán:
                    <Badge
                      variant={isQuantityMet ? "default" : "outline"}
                      className={
                        isQuantityMet
                          ? "bg-emerald-600 text-white text-[10px] h-4 px-1.5"
                          : "text-amber-600 border-amber-500/30 bg-amber-500/10 text-[10px] h-4 px-1.5"
                      }
                    >
                      {totalAssigned} / {item.quantity} máy
                    </Badge>
                  </span>

                  {!isReadOnly && itemSerials.length > 0 && !isItemWarrantyActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleActivateItem(item.id)}
                      disabled={isActivating}
                      className="h-6 text-xs text-tech-blue hover:text-tech-blue/80 hover:bg-tech-blue/10 px-2"
                    >
                      <Zap className="mr-1 h-3 w-3" />
                      Kích hoạt mục này
                    </Button>
                  )}
                </div>

                {itemSerials.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic py-1">
                    Chưa quét / gán mã Serial nào cho mục hàng này.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {itemSerials.map((s) => {
                      const isActive = s.warrantyStatus === "Active";
                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between rounded-md border border-line bg-card p-2 text-xs"
                        >
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <div className="flex items-center gap-1 font-mono font-semibold text-foreground truncate">
                              <span>SN: {s.serialNumber}</span>
                            </div>
                            {s.imei && (
                              <div className="text-[11px] font-mono text-muted-foreground truncate">
                                IMEI: {s.imei}
                              </div>
                            )}
                            <div className="flex items-center gap-1 pt-0.5 text-[10px]">
                              {isActive ? (
                                <Badge className="bg-emerald-600/15 text-emerald-600 border-emerald-500/20 text-[10px] h-4 px-1">
                                  <CheckCircle className="mr-0.5 h-2.5 w-2.5" />
                                  Active đến {formatDate(s.warrantyExpiresAt)}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-amber-600 border-amber-500/20 bg-amber-50/50 text-[10px] h-4 px-1">
                                  <Clock className="mr-0.5 h-2.5 w-2.5" />
                                  Chờ kích hoạt
                                </Badge>
                              )}
                            </div>
                          </div>

                          {!isReadOnly && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemove(s.id)}
                              disabled={isRemoving}
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Ô input quét mã vạch barcode thêm nhanh */}
              {!isReadOnly && (
                <div className="pt-2 border-t border-line/40">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full">
                      <Input
                        placeholder="Quét mã vạch hoặc nhập Serial (nhấn Enter để thêm)..."
                        value={itemInput.serialNumber}
                        onChange={(e) => handleInputChange(item.id, "serialNumber", e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, item)}
                        disabled={isAssigning}
                        className="font-mono text-xs pr-20"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hidden sm:inline">
                        Nhấn ↵ Enter
                      </span>
                    </div>

                    <div className="w-full sm:w-44">
                      <Input
                        placeholder="IMEI (tùy chọn)"
                        value={itemInput.imei}
                        onChange={(e) => handleInputChange(item.id, "imei", e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, item)}
                        disabled={isAssigning}
                        className="font-mono text-xs"
                      />
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleQuickAdd(item)}
                      disabled={isAssigning || !itemInput.serialNumber.trim()}
                      className="w-full sm:w-auto bg-tech-blue text-white hover:bg-tech-blue/90 text-xs shrink-0"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      {isAssigning ? "Đang thêm..." : "Thêm Serial"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
