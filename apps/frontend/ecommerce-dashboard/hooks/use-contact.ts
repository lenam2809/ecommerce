"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { contactService } from '@/services/contact-service';
import { ContactDto } from '@/types/contact';
import { toast } from './use-toast';

const contactKeys = {
    all: ['contact'] as const,
    lists: () => [...contactKeys.all, 'list'] as const,
    list: (params: any) => [...contactKeys.lists(), params] as const,
    details: () => [...contactKeys.all, 'detail'] as const,
    detail: (id: string) => [...contactKeys.details(), id] as const,
};

export const useGetContacts = () => {
    return useQuery({
        queryKey: contactKeys.lists(),
        queryFn: () => contactService.getAllContacts(),
        staleTime: 1000 * 60 * 5,
    });
};

export const useGetContact = (id: string) => {
    return useQuery({
        queryKey: contactKeys.detail(id),
        queryFn: () => contactService.getContactById(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
    });
};

export const useCreateContact = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (contactData: Omit<ContactDto, 'id'>) =>
            contactService.createContact(contactData),
        onSuccess: (data) => {
            toast({
                title: "Tạo mới Contact",
                description: "Tạo mới Contact thành công!",
            });
            queryClient.invalidateQueries({ queryKey: contactKeys.all });
            router.push('/contact');
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi tạo Contact",
                description: error.response?.data?.message || 'Có lỗi xảy ra khi tạo Contact',
                variant: "destructive",
            });
        }
    });
};

export const useUpdateContact = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: ContactDto }) =>
            contactService.updateContact(id, data),
        onSuccess: (_, variables) => {
            toast({
                title: "Cập nhật Contact",
                description: "Cập nhật Contact thành công!",
            });
            queryClient.invalidateQueries({ queryKey: contactKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi cập nhật Contact",
                description: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật Contact',
                variant: "destructive",
            });
        }
    });
};

export const useUpdateContactStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) =>
            contactService.updateContactStatus(id, isActive),
        onSuccess: (_, variables) => {
            const action = variables.isActive ? "kích hoạt" : "hủy kích hoạt";
            toast({
                title: "Cập nhật trạng thái Contact",
                description: `Đã ${action} Contact thành công!`,
            });
            queryClient.invalidateQueries({ queryKey: contactKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi cập nhật trạng thái Contact",
                description: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái Contact',
                variant: "destructive",
            });
        }
    });
};

export const useDeleteContact = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => contactService.deleteContact(id),
        onSuccess: (_, variables) => {
            toast({
                title: "Xóa Contact",
                description: "Xóa Contact thành công!",
            });
            queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi xóa Contact",
                description: error.response?.data?.message || 'Có lỗi xảy ra khi xóa Contact',
                variant: "destructive",
            });
        }
    });
};