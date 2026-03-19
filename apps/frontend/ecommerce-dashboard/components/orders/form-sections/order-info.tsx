import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { FormSingleSelect } from "@/components/ui/select/form-single-select";
import { useGetOptionUsers } from "@/hooks/use-users";
import { EOrderStatus } from "@/types/order";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/date-picker";

interface OrderInfoSectionProps {
  form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isEditing?: boolean;
  isDetail?: boolean;
}

export function OrderInfoSection({ form, isEditing = false, isDetail = false }: OrderInfoSectionProps) {
  const { data: users, isLoading: usersLoading } = useGetOptionUsers?.() || { data: null, isLoading: false };

  const orderStatusOptions = [
    { label: "Chờ xác nhận", value: EOrderStatus.Pending },
    { label: "Đang xử lý", value: EOrderStatus.Processing },
    { label: "Đã gửi hàng", value: EOrderStatus.Shipped },
    { label: "Hoàn thành", value: EOrderStatus.Completed },
    { label: "Đã giao hàng", value: EOrderStatus.Delivered },
    { label: "Đã huỷ", value: EOrderStatus.Cancelled },
    { label: "Đã hoàn tiền", value: EOrderStatus.Refunded },
    { label: "Yêu cầu trả hàng", value: EOrderStatus.ReturnRequested },
    { label: "Đã trả hàng", value: EOrderStatus.Returned },
  ];

  return (
    <FormSection title="Thông tin đơn hàng">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(isEditing || isDetail) && (
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã đơn hàng *</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập mã đơn hàng" {...field} disabled={isDetail || isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {users ? (
          <FormSingleSelect
            name="applicationUserId"
            label="Khách hàng *"
            placeholder="Chọn khách hàng"
            options={users?.data || []}
            isLoading={usersLoading}
            loadingMessage="Đang tải danh sách khách hàng..."
            disabled={isDetail || isEditing}
          />
        ) : (
          <FormField
            control={form.control}
            name="applicationUserId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Khách hàng *</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập ID khách hàng" {...field} disabled={isDetail || isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(isEditing || isDetail) && (
          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tổng tiền *</FormLabel>
                <FormControl>
                  <CurrencyInput
                    placeholder="Nhập tổng tiền"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    disabled={isDetail || isEditing}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="discountCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã giảm giá</FormLabel>
              <FormControl>
                <Input placeholder="Nhập mã giảm giá (nếu có)" {...field} disabled={isDetail || isEditing} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditing && (
          <FormField
            control={form.control}
            name="orderDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày đặt hàng</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ""}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormSingleSelect
          name="status"
          label="Trạng thái đơn hàng *"
          placeholder="Chọn trạng thái"
          options={orderStatusOptions || []}
          disabled={isDetail}
        />

        <DatePicker
          form={form}
          name="expectedDeliveryDate"
          label="Ngày giao hàng dự kiến"
          placeholder="Chọn ngày"
          dateFormat="dd/MM/yyyy"
          clearable
          showTodayButton
          disabled={isDetail}
        />
      </div>
    </FormSection>
  );
}
