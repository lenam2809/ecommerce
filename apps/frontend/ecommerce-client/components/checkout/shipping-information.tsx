import { useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useLocation } from "@/hooks/use-location"

interface ShippingInformationProps {
    form: UseFormReturn<any>
}

export function ShippingInformation({ form }: ShippingInformationProps) {
    const {
        provinces,
        districts,
        wards,
        isLoading,
        fetchDistricts,
        fetchWards,
        setDistricts,
        setWards
    } = useLocation()

    const city = form.watch("city")
    const district = form.watch("district")

    // Handle initial data loading or when city/district matches available data
    useEffect(() => {
        if (city && provinces.length > 0) {
            const province = provinces.find(p => p.name === city)
            if (province) {
                // Only fetch if we don't have districts or if the current districts belong to another province
                // But checking "belong to another" is hard without storing provinceId. 
                // Simplest is to just fetch. The API is fast.
                // To optimize, we could check if districts array is empty or check variables.
                // For now, let's rely on the fact that if we change city, districts are cleared.
                fetchDistricts(province.code)
            }
        }
    }, [city, provinces.length]) // Depend on length to trigger when data arrives

    useEffect(() => {
        if (district && districts.length > 0) {
            const d = districts.find(item => item.name === district)
            if (d) {
                fetchWards(d.code)
            }
        }
    }, [district, districts.length])

    return (
        <div className="bg-card text-card-foreground rounded-lg border border-border/20 overflow-hidden">
            <div className="p-4 bg-muted border-b border-border/20">
                <h3 className="font-medium text-foreground">Thông tin giao hàng</h3>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Họ và tên *</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email *</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div>
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Số điện thoại *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="0xxxxxxxxx" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div>
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tỉnh/Thành phố *</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value)
                                            // Reset child fields
                                            form.setValue("district", "")
                                            form.setValue("ward", "")
                                            // Trigger fetch
                                            const p = provinces.find(p => p.name === value)
                                            if (p) fetchDistricts(p.code)
                                            else setDistricts([])
                                        }}
                                        value={field.value}
                                        disabled={isLoading.provinces}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn tỉnh/thành phố" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {provinces.map((province) => (
                                                <SelectItem key={province.code} value={province.name}>
                                                    {province.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div>
                        <FormField
                            control={form.control}
                            name="district"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quận/Huyện *</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value)
                                            form.setValue("ward", "")
                                            const d = districts.find(item => item.name === value)
                                            if (d) fetchWards(d.code)
                                            else setWards([])
                                        }}
                                        value={field.value}
                                        disabled={!city || isLoading.districts}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn quận/huyện" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {districts.map((item) => (
                                                <SelectItem key={item.code} value={item.name}>
                                                    {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div>
                        <FormField
                            control={form.control}
                            name="ward"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phường/Xã *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={!district || isLoading.wards}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn phường/xã" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {wards.map((item) => (
                                                <SelectItem key={item.code} value={item.name}>
                                                    {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Địa chỉ cụ thể *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Số nhà, tên đường..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ghi chú giao hàng (tùy chọn)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                                            className="resize-none"
                                            maxLength={500}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
