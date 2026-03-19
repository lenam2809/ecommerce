"use client"

import { useCallback } from "react"
import { AppToaster, AppToastProps } from "./app-toaster"

export function useAppToast() {
    /**
     * Show a toast notification
     */
    const showToast = useCallback((props: AppToastProps) => {
        return AppToaster.show(props)
    }, [])

    /**
     * Show a success toast notification
     */
    const showSuccess = useCallback((title: string, props?: Omit<AppToastProps, "type" | "title">) => {
        return AppToaster.success(title, props)
    }, [])

    /**
     * Show an error toast notification
     */
    const showError = useCallback((title: string, props?: Omit<AppToastProps, "type" | "title">) => {
        return AppToaster.error(title, props)
    }, [])

    /**
     * Show a warning toast notification
     */
    const showWarning = useCallback((title: string, props?: Omit<AppToastProps, "type" | "title">) => {
        return AppToaster.warning(title, props)
    }, [])

    /**
     * Show an info toast notification
     */
    const showInfo = useCallback((title: string, props?: Omit<AppToastProps, "type" | "title">) => {
        return AppToaster.info(title, props)
    }, [])

    /**
     * Show a toast for a promise with loading, success, and error states
     */
    const showPromise = useCallback(
        <T,>(
            promise: Promise<T>,
            options: {
                loading: string | AppToastProps
                success: string | ((data: T) => AppToastProps)
                error: string | ((error: unknown) => AppToastProps)
            },
        ) => {
            return AppToaster.promise(promise, options)
        },
        [],
    )

    /**
     * Dismiss a specific toast by ID
     */
    const dismissToast = useCallback((toastId?: string) => {
        AppToaster.dismiss(toastId)
    }, [])

    /**
     * Dismiss all toasts
     */
    const dismissAllToasts = useCallback(() => {
        AppToaster.dismissAll()
    }, [])

    return {
        toast: showToast,
        success: showSuccess,
        error: showError,
        warning: showWarning,
        info: showInfo,
        promise: showPromise,
        dismiss: dismissToast,
        dismissAll: dismissAllToasts,
    }
}
