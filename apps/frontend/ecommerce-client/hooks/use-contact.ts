// use-contact.ts
"use client";

import { useQuery } from "@tanstack/react-query"
import contactService from "@/services/contact-service";

export function useContact() {
    return useQuery({
        queryKey: ["contact"],
        queryFn: () => contactService.getContactActive(),
        staleTime: 1000 * 60 * 10, // 10 minutes
        select: (data) => {
            return data.data
        },
        throwOnError: true,
    })
}

export function useAllContacts() {
    return useQuery({
        queryKey: ["contacts", "all"],
        queryFn: () => contactService.getAllContacts(),
        staleTime: 1000 * 60 * 10, // 10 minutes
        select: (data) => {
            return data.data
        },
        throwOnError: true,
    })
}
