"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import addressService from "@/services/address-service";
import { CreateAddressDto, UpdateAddressDto } from "@/types/address";
import { AppToaster } from "@/components/toast/app-toaster";

export function useAddresses() {
    return useQuery({
        queryKey: ["addresses"],
        queryFn: () => addressService.getMyAddresses(),
        select: (data) => data.data,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useAddress(id: string) {
    return useQuery({
        queryKey: ["address", id],
        queryFn: () => addressService.getAddressById(id),
        enabled: !!id,
        select: (data) => data.data,
    });
}

export function useCreateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAddressDto) => addressService.createAddress(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
            AppToaster.success("Thành công", {
                description: "Thêm địa chỉ mới thành công",
            })
        },
    });
}

export function useUpdateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAddressDto }) =>
            addressService.updateAddress(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
            AppToaster.success("Thành công", {
                description: "Cập nhật địa chỉ thành công",
            })
        },
    });
}

export function useDeleteAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => addressService.deleteAddress(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
            AppToaster.success("Thành công", {
                description: "Xóa địa chỉ thành công",
            })
        },
    });
}

export function useSetDefaultAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => addressService.setDefaultAddress(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
            AppToaster.success("Thành công", {
                description: "Đặt địa chỉ mặc định thành công",
            })
        },
    });
}