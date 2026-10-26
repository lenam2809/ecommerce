"use client"

import { logger } from "@/lib/logger"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { useCart } from "@/hooks/use-cart"
import { useCreateOrder } from "@/hooks/use-orders"
import { CreateOrderRequest } from "@/types/order"
import { CheckoutFormValues } from "@/types/checkout"
import { CheckoutBreadcrumbs } from "@/components/checkout/checkout-breadcrumbs"
import { useAuth } from "@/hooks/use-auth"
import { formatPrice } from "@/lib/contants"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Crown, UserCheck, UserPlus, LogIn, ArrowRight } from "lucide-react"

const ShippingInformation = dynamic(
  () => import("@/components/checkout/shipping-information").then((m) => ({ default: m.ShippingInformation })),
  {
    loading: () => <div className="h-96 bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl animate-pulse" />,
  }
)

const PaymentMethod = dynamic(
  () => import("@/components/checkout/payment-method").then((m) => ({ default: m.PaymentMethod })),
  {
    loading: () => <div className="h-96 bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl animate-pulse" />,
  }
)

const OrderSummary = dynamic(
  () => import("@/components/checkout/order-summary").then((m) => ({ default: m.OrderSummary })),
  {
    loading: () => <div className="h-96 bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl animate-pulse" />,
  }
)

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phoneNumber: z.string().regex(/^(0|\+84)\d{9,10}$/, "Số điện thoại không hợp lệ"),
  city: z.string().optional(),
  district: z.string().optional(),
  ward: z.string().optional(),
  address: z.string().min(3, "Địa chỉ phải có ít nhất 3 ký tự"),
  paymentMethod: z.string().min(1, "Vui lòng chọn phương thức thanh toán"),
  note: z.string().optional(),
  deliveryMethod: z.enum(["StandardDelivery", "Express2H", "ShowroomPickup", "delivery", "pickup"]).optional(),
  showroomId: z.string().optional(),
  requireInvoice: z.boolean().optional(),
  taxCode: z.string().optional(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  invoiceEmail: z.string().optional(),
})

type CheckoutMode = "member" | "guest" | "login"

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const createOrder = useCreateOrder()
  const { user } = useAuth()
  const router = useRouter()
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("member")

  const cartItems = cart?.items || []
  const subtotal = cart?.subtotal ?? cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = cart?.discount ?? 0
  const isFreeShipping = (cart?.shippingCost === 0) || subtotal >= 500000
  const shippingCost = isFreeShipping ? 0 : (cart?.shippingCost || 30000)
  const total = cart?.total ?? Math.max(0, subtotal - discount + shippingCost)

  const isLoginModeForGuest = !user && checkoutMode === "login"

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user ? `${user.lastName || ""} ${user.firstName || ""}`.trim() : "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      address: "",
      city: "",
      district: "",
      ward: "",
      paymentMethod: "vnpay",
      note: "",
      deliveryMethod: "delivery",
      showroomId: undefined,
      requireInvoice: false,
    },
  })

  const selectedPaymentMethod = form.watch("paymentMethod")

  useEffect(() => {
    if (!user) {
      return
    }

    form.reset({
      fullName: `${user.lastName || ""} ${user.firstName || ""}`.trim(),
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      address: form.getValues("address") || "",
      city: form.getValues("city") || "",
      district: form.getValues("district") || "",
      ward: form.getValues("ward") || "",
      paymentMethod: form.getValues("paymentMethod") || "vnpay",
      note: form.getValues("note") || "",
      deliveryMethod: form.getValues("deliveryMethod") || "delivery",
      showroomId: form.getValues("showroomId"),
      requireInvoice: form.getValues("requireInvoice") || false,
    })
  }, [user, form])

  const getDynamicSubmitLabel = (method: string) => {
    if (isLoginModeForGuest) return "Đăng nhập để tiếp tục"
    const formattedTotal = formatPrice(total)
    switch (method) {
      case "vnpay":
        return `Thanh toán qua VNPAY • ${formattedTotal}`
      case "bank":
        return `Thanh toán qua VietQR • ${formattedTotal}`
      case "momo":
        return `Thanh toán qua MoMo • ${formattedTotal}`
      case "zalopay":
        return `Thanh toán qua ZaloPay • ${formattedTotal}`
      case "credit":
        return `Thanh toán Thẻ quốc tế • ${formattedTotal}`
      case "cod":
        return `Xác nhận đặt hàng COD • ${formattedTotal}`
      default:
        return `Hoàn tất đơn hàng • ${formattedTotal}`
    }
  }

  const handleLoginRedirect = () => {
    router.push(`/login?returnUrl=${encodeURIComponent("/checkout")}`)
  }

  const onSubmit = async (values: CheckoutFormValues) => {
    if (isLoginModeForGuest) {
      handleLoginRedirect()
      return
    }

    if (cartItems.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống")
      return
    }

    try {
      const orderData: CreateOrderRequest = {
        shippingAddress:
          values.deliveryMethod === "pickup"
            ? values.address
            : [values.address, values.ward, values.district, values.city].filter(Boolean).join(", "),
        phone: values.phoneNumber,
        email: values.email,
        ...(user ? {} : { guestName: values.fullName.trim() }),
        deliveryInstructions: values.note || undefined,
        deliveryMethod: values.deliveryMethod,
        showroomId: values.showroomId,
        invoice: values.requireInvoice
          ? {
              requireInvoice: true,
              taxCode: values.taxCode || "",
              companyName: values.companyName || "",
              companyAddress: values.companyAddress || "",
              invoiceEmail: values.invoiceEmail || values.email,
            }
          : undefined,
        orderItems: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          addOnId: item.addOnId,
          productVariantSkuId: item.productVariantSkuId,
        })),
      }

      const result = await createOrder.mutateAsync(orderData)

      if (result.success) {
        const orderId = result.data
        if (!orderId) {
          throw new Error("Không nhận được mã đơn hàng từ hệ thống")
        }

        if (values.paymentMethod === "vnpay") {
          try {
            const paymentData = {
              orderType: "billpayment",
              amount: total,
              orderDescription: `Thanh toan don hang ${orderId}`,
              name: values.fullName,
              orderId,
            }

            const { default: paymentService } = await import("@/services/payment-service")
            const paymentResponse = await paymentService.createVnPayUrl(paymentData)

            if (paymentResponse?.paymentUrl) {
              window.location.href = paymentResponse.paymentUrl
              return
            }
          } catch (paymentError) {
            logger.error("VNPay URL creation failed", paymentError)
            toast.error("Lỗi tạo link thanh toán VNPay")
            if (user) {
              router.push(`/account/orders/${orderId}`)
            } else {
              router.push(`/payment/vnpay-return?success=false&orderId=${orderId}`)
            }
            return
          }
        }

        toast.success("Đặt hàng thành công")
        clearCart()
        router.push(`/payment/vnpay-return?success=true&orderId=${orderId}`)
      } else {
        toast.error(result.message || "Đặt hàng thất bại. Vui lòng kiểm tra lại thông tin.")
      }
    } catch (error: unknown) {
      logger.error("Order creation error:", error)
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      toast.error(err?.response?.data?.message || err?.message || "Đặt hàng thất bại. Vui lòng kiểm tra lại thông tin.")
    }
  }

  return (
    <div className="min-h-screen bg-background pb-28 lg:pb-14">
      <div className="container-app py-6 md:py-8">
        <CheckoutBreadcrumbs />

        {/* Page Title & VIP Diamond Member Banner */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-primary mb-1">
              ShopViet Secure Checkout • 2026
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Thanh toán & Giao nhận đơn hàng
            </h1>
          </div>

          {/* User Status Card + Guest Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2 bg-card p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            {user ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-primary text-white shadow-xs">
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span>Thành viên: {user.fullName || `${user.lastName || ""} ${user.firstName || ""}`.trim() || user.email}</span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setCheckoutMode("guest")}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    checkoutMode === "guest"
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Mua hàng không cần đăng nhập</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutMode("login")}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    checkoutMode === "login"
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Đăng nhập tài khoản</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Member Privilege Strip */}
        {user && (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white p-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center ring-2 ring-amber-400/60 shrink-0">
                {(user.firstName?.charAt(0) || user.email?.charAt(0) || "U").toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-sm md:text-base text-white">
                    {user.fullName || `${user.lastName || ""} ${user.firstName || ""}`.trim() || user.email}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold">
                    <Crown className="h-3 w-3" />
                    Thành viên ShopViet
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Đặc quyền: Miễn phí giao hỏa tốc cho đơn từ 500.000₫ • Giữ máy ưu tiên tại 45 Showroom
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 shrink-0">
              <UserCheck className="h-4 w-4" />
              <span>Đã xác thực</span>
            </div>
          </div>
        )}

        {/* Login prompt when switching to "login" mode */}
        {isLoginModeForGuest && (
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-blue-50/70 dark:bg-blue-950/30 p-4">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Đăng nhập tài khoản để đồng bộ sổ địa chỉ và theo dõi đơn hàng dễ dàng hơn.
            </p>
            <Button
              type="button"
              onClick={handleLoginRedirect}
              className="rounded-xl bg-primary text-white hover:bg-primary/90 h-10 px-5 text-xs font-bold shadow-xs shrink-0 cursor-pointer"
            >
              Đăng nhập ngay
            </Button>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-6">
                <ShippingInformation form={form} isMemberMode={Boolean(user)} />
                <PaymentMethod form={form} total={total} />
              </div>

              <div className="lg:col-span-1">
                <OrderSummary
                  cartItems={cartItems}
                  subtotal={subtotal}
                  shippingCost={shippingCost}
                  discount={discount}
                  total={total}
                  isSubmitting={form.formState.isSubmitting}
                  isEmpty={cartItems.length === 0}
                  isSubmitDisabled={isLoginModeForGuest}
                  submitButtonText={getDynamicSubmitLabel(selectedPaymentMethod)}
                />
              </div>
            </div>

            {/* Mobile Sticky Bottom Checkout Bar (390px viewport D2-04) */}
            <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-card/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                    Tổng thanh toán ({cartItems.reduce((s, i) => s + i.quantity, 0)} món)
                  </span>
                  <span className="text-lg font-extrabold text-brand font-mono tabular-nums whitespace-nowrap">
                    {formatPrice(total)}
                  </span>
                </div>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || cartItems.length === 0 || isLoginModeForGuest}
                  className="h-12 px-5 rounded-xl bg-brand hover:bg-brand/90 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 tabular-nums cursor-pointer"
                >
                  <span>{getDynamicSubmitLabel(selectedPaymentMethod)}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
