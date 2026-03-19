/**
 * Guest ID Management Utilities
 * Used for identifying guest users before they log in
 */

const GUEST_ID_KEY = 'guest_id';

/**
 * Get or create a guest ID for anonymous users
 * @returns Guest ID string (UUID format)
 */
export function getOrCreateGuestId(): string {
    if (typeof window === 'undefined') {
        return ''; // Server-side rendering, return empty
    }

    let guestId = localStorage.getItem(GUEST_ID_KEY);

    if (!guestId) {
        // Generate new UUID v4
        guestId = crypto.randomUUID();
        localStorage.setItem(GUEST_ID_KEY, guestId);
    }

    return guestId;
}

/**
 * Clear the guest ID (typically called after successful login)
 */
export function clearGuestId(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(GUEST_ID_KEY);
    }
}

/**
 * Get the guest ID without creating a new one
 * @returns Guest ID string or null if doesn't exist
 */
export function getGuestId(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    return localStorage.getItem(GUEST_ID_KEY);
}
