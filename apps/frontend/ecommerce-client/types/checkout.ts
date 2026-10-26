export interface CheckoutFormValues {
  fullName: string
  email: string
  phoneNumber: string
  city?: string
  district?: string
  ward?: string
  address: string
  paymentMethod: string
  note?: string
  deliveryMethod?: "StandardDelivery" | "Express2H" | "ShowroomPickup" | "delivery" | "pickup"
  showroomId?: string
  requireInvoice?: boolean
  taxCode?: string
  companyName?: string
  companyAddress?: string
  invoiceEmail?: string
}
