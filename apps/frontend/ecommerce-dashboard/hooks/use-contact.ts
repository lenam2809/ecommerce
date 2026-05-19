"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { contactService } from '@/services/contact-service';
import { ContactDto } from '@/types/contact';
import { toast } from './use-toast';
import { handleApiError } from '@/lib/api-error';

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
        onSuccess: () => {
            toast({
                title: "Tạo mới Contact",
                description: "Tạo mới Contact thành công!",
            });
            queryClient.invalidateQueries({ queryKey: contactKeys.all });
            router.push('/contact');
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'createContact' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
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
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'updateContact' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
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
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'updateContactStatus' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useDeleteContact = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => contactService.deleteContact(id),
        onSuccess: () => {
            toast({
                title: "Xóa Contact",
                description: "Xóa Contact thành công!",
            });
            queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'deleteContact' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};
