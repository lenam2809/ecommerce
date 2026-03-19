"use client"

import { useState, useEffect } from 'react';
import { getOrCreateGuestId } from '@/lib/guest-id';

/**
 * Custom hook for guest ID management
 * @returns Guest ID string
 */
export function useGuestId() {
    const [guestId, setGuestId] = useState<string>('');

    useEffect(() => {
        // Only run on client-side
        if (typeof window !== 'undefined') {
            setGuestId(getOrCreateGuestId());
        }
    }, []);

    return guestId;
}
