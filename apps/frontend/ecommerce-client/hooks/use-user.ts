"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import userService from "@/services/user-service"
import { AppToaster } from "@/components/toast/app-toaster"
import { FormAddressSchema, FormUpdateUserSchema } from "@/schemas/user-schema"

export function useUser() {
  const queryClient = useQueryClient()

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userService.getCurrentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => {
      return data.data
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: (userData: FormUpdateUserSchema) => userService.updateUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
      AppToaster.success("Cập nhật thông tin thành công", {
        description: "Thông tin cá nhân của bạn đã được cập nhật.",
      })
    },
  })

  return {
    user,
    isLoading,
    error,
    updateUser: updateUserMutation.mutate,
    isUpdatingUser: updateUserMutation.isPending,
  }
}

export function useAddresses() {
  const queryClient = useQueryClient()

  const {
    data: addresses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => userService.getAddresses(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const addAddressMutation = useMutation({
    mutationFn: (address: FormAddressSchema) => userService.addAddress(address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      AppToaster.success("Thêm địa chỉ thành công", {
        description: "Địa chỉ mới đã được thêm vào tài khoản của bạn.",
      })
    },
  })

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, address }: { id: string; address: FormAddressSchema }) =>
      userService.updateAddress(id, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      AppToaster.success("Cập nhật địa chỉ thành công", {
        description: "Địa chỉ của bạn đã được cập nhật.",
      })
    },
  })

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => userService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      AppToaster.success("Xóa địa chỉ thành công", {
        description: "Địa chỉ đã được xóa khỏi tài khoản của bạn.",
      })
    },
  })

  const setDefaultAddressMutation = useMutation({
    mutationFn: (id: string) => userService.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      AppToaster.success("Đặt địa chỉ mặc định thành công", {
        description: "Địa chỉ mặc định đã được cập nhật.",
      })
    },
  })

  return {
    addresses,
    isLoading,
    error,
    addAddress: addAddressMutation.mutate,
    isAddingAddress: addAddressMutation.isPending,
    updateAddress: updateAddressMutation.mutate,
    isUpdatingAddress: updateAddressMutation.isPending,
    deleteAddress: deleteAddressMutation.mutate,
    isDeletingAddress: deleteAddressMutation.isPending,
    setDefaultAddress: setDefaultAddressMutation.mutate,
    isSettingDefaultAddress: setDefaultAddressMutation.isPending,
  }
}
