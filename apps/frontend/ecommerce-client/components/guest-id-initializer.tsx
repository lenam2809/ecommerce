"use client"

import { useEffect } from 'react';
import { getOrCreateGuestId } from '@/lib/guest-id';

/**
 * Initialize Guest ID when the app loads
 * This component ensures a Guest ID is created for anonymous users
 */
export function GuestIdInitializer() {
    useEffect(() => {
        // Create or retrieve guest ID on mount
        getOrCreateGuestId();
    }, []);

    return null; // This component doesn't render anything
}
