import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ShippingSectionProps {
  form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isEditing?: boolean;
  isDetail?: boolean;
}

export function ShippingSection({ form, isDetail = false }: ShippingSectionProps) {
  return (
    <FormSection title="Thông tin giao hàng">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="shippingAddress"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Địa chỉ giao hàng *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập địa chỉ giao hàng"
                  className="min-h-24"
                  {...field}
                  disabled={isDetail}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại *</FormLabel>
              <FormControl>
                <Input placeholder="Nhập số điện thoại" {...field} disabled={isDetail} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input placeholder="Nhập email" type="email" {...field} disabled={isDetail} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deliveryInstructions"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Hướng dẫn giao hàng</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập hướng dẫn giao hàng (tuỳ chọn)"
                  className="min-h-24"
                  {...field}
                  disabled={isDetail}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSection>
  );
}
