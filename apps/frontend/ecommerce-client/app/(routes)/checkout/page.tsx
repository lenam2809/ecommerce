"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { useCart } from "@/hooks/use-cart"
import { useCreateOrder } from "@/hooks/use-orders"
import { CreateOrderRequest } from "@/types/order"
import { CheckoutBreadcrumbs } from "@/components/checkout/checkout-breadcrumbs"
import { ShippingInformation } from "@/components/checkout/shipping-information"
import { PaymentMethod } from "@/components/checkout/payment-method"
import { OrderSummary } from "@/components/checkout/order-summary"
import { useAuth } from "@/hooks/use-auth"
import { Form } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phoneNumber: z.string().regex(/^(0|\+84)\d{9,10}$/, "Số điện thoại không hợp lệ"),
  city: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
  district: z.string().min(1, "Vui lòng chọn Quận/Huyện"),
  ward: z.string().min(1, "Vui lòng chọn Phường/Xã"),
  address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  paymentMethod: z.string().min(1, "Vui lòng chọn phương thức thanh toán"),
  note: z.string().optional(),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>
type CheckoutMode = "guest" | "login"

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const createOrder = useCreateOrder()
  const { user } = useAuth()
  const router = useRouter()
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("guest")

  const cartItems = cart?.items || []
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const shippingCost = subtotal > 500000 ? 0 : 30000
  const total = subtotal + shippingCost

  const isLoginModeForGuest = !user && checkoutMode === "login"

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      city: "",
      district: "",
      ward: "",
      paymentMethod: "cod",
      note: "",
    },
  })

  useEffect(() => {
    if (!user) {
      return
    }

    form.reset({
      fullName: `${user.lastName || ""} ${user.firstName || ""}`.trim(),
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      address: "",
      city: "",
      district: "",
      ward: "",
      paymentMethod: "cod",
      note: "",
    })
  }, [user, form])

  const handleLoginRedirect = () => {
    router.push("/login?from=/checkout")
  }

  const onSubmit = async (values: CheckoutFormValues) => {
    if (isLoginModeForGuest) {
      handleLoginRedirect()
      return
    }

    if (cartItems.length === 0) {
      toast.error("Giỏ hàng trống")
      return
    }

    try {
      const orderData: CreateOrderRequest = {
        shippingAddress: `${values.address}, ${values.ward}, ${values.district}, ${values.city}`,
        phone: values.phoneNumber,
        email: values.email,
        ...(user ? {} : { guestName: values.fullName.trim() }),
        deliveryInstructions: values.note || undefined,
        orderItems: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        })),
      }

      const result = await createOrder.mutateAsync(orderData)

      if (result.success) {
        if (values.paymentMethod === "vnpay") {
          try {
            const paymentData = {
              orderType: "billpayment",
              amount: total,
              orderDescription: `Thanh toan don hang ${result.data}`,
              name: values.fullName,
              orderId: result.data,
            }

            const { default: paymentService } = await import("@/services/payment-service")
            const paymentResponse = await paymentService.createVnPayUrl(paymentData)

            if (paymentResponse?.paymentUrl) {
              window.location.href = paymentResponse.paymentUrl
              return
            }
          } catch (paymentError) {
            console.error("VNPay URL creation failed", paymentError)
            toast.error("Lỗi tạo link thanh toán VNPay")
            if (user) {
              router.push(`/account/orders/${result.data}`)
            } else {
              router.push("/")
            }
            return
          }
        }

        toast.success("Đặt hàng thành công")
        clearCart()

        if (user) {
          router.push(`/account/orders/${result.data}`)
          return
        }

        router.push("/")
      } else {
        const prodMsg = "Something went wrong, please try again later"
        const devMsg = result.error || "Có lỗi xảy ra khi đặt hàng"
        toast.error(process.env.NODE_ENV === "development" ? devMsg : prodMsg)
      }
    } catch (error) {
      console.error("Order creation error:", error)
      toast.error("Có lỗi xảy ra khi đặt hàng")
    }
  }

  return (
    <>
      <CheckoutBreadcrumbs />
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Thanh toán</h1>

      {!user && (
        <div className="mb-6 rounded-lg border border-border/20 bg-card p-4">
          <p className="mb-3 text-sm font-medium">Bạn muốn tiếp tục theo cách nào?</p>
          <RadioGroup
            value={checkoutMode}
            onValueChange={(value) => setCheckoutMode(value as CheckoutMode)}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 rounded-md border border-border/20 p-3">
              <RadioGroupItem id="checkout-mode-guest" value="guest" />
              <Label htmlFor="checkout-mode-guest" className="cursor-pointer">
                Mua như khách
              </Label>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border/20 p-3">
              <RadioGroupItem id="checkout-mode-login" value="login" />
              <Label htmlFor="checkout-mode-login" className="cursor-pointer">
                Đăng nhập để sử dụng tài khoản
              </Label>
            </div>
          </RadioGroup>

          {isLoginModeForGuest && (
            <div className="mt-4 flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 p-3">
              <p className="text-sm text-muted-foreground">Đăng nhập để theo dõi đơn hàng trong tài khoản của bạn.</p>
              <Button type="button" onClick={handleLoginRedirect}>
                Đăng nhập
              </Button>
            </div>
          )}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <ShippingInformation form={form} />
              <PaymentMethod form={form} />
            </div>

            <div className="lg:col-span-1">
              <OrderSummary
                cartItems={cartItems}
                subtotal={subtotal}
                shippingCost={shippingCost}
                total={total}
                isSubmitting={form.formState.isSubmitting}
                isEmpty={cartItems.length === 0}
                isSubmitDisabled={isLoginModeForGuest}
                submitButtonText={isLoginModeForGuest ? "Đăng nhập để tiếp tục" : "Hoàn tất đơn hàng"}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  )
}
