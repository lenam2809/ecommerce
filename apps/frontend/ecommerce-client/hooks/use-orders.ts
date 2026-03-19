"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import orderService from "@/services/order-service";
import { CreateOrderRequest, OrderFilters, UpdateOrderRequest, OrderStatus } from "@/types/order";

export function useOrders(filters: OrderFilters = {}) {
    return useQuery({
        queryKey: ["orders", filters],
        queryFn: () => orderService.getOrders(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (data) => {
            return data.data;
        },
        throwOnError: true,
    });
}

export function useMyOrders() {
    return useQuery({
        queryKey: ["my-orders"],
        queryFn: () => orderService.getMyOrders(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (data) => {
            return data.data;
        },
    });
}

export function useOrder(id: string) {
    return useQuery({
        queryKey: ["order", id],
        queryFn: () => orderService.getOrderById(id),
        staleTime: 1000 * 60 * 10, // 10 minutes
        enabled: !!id,
        select: (data) => {
            return data.data;
        },
    });
}

export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderData: CreateOrderRequest) => orderService.createOrder(orderData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["my-orders"] });
        },
        onError: (error) => {
            console.error("Error creating order:", error);
        },
    });
}

export function useUpdateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, orderData }: { id: string; orderData: UpdateOrderRequest }) =>
            orderService.updateOrder(id, orderData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["my-orders"] });
            queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
        },
    });
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
            orderService.updateOrderStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["my-orders"] });
            queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
        },
    });
}

export function useDeleteOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => orderService.deleteOrder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["my-orders"] });
        },
    });
}