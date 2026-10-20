"use client"

import { logger } from '@/lib/logger'
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef, ReactNode } from 'react'
import * as signalR from '@microsoft/signalr'
import { useAuth } from '@/hooks/use-auth'
import { Review } from '@/types/product'

interface SignalRContextType {
    connection: signalR.HubConnection | null // Kept for backward compatibility (ReviewHub)
    notificationConnection: signalR.HubConnection | null // New NotificationHub
    isConnected: boolean // ReviewHub status
    isNotificationConnected: boolean // NotificationHub status
    joinProductGroup: (productId: string) => Promise<void>
    leaveProductGroup: (productId: string) => Promise<void>
    sendTypingIndicator: (productId: string, isTyping: boolean) => Promise<void>
    onNewReview: (callback: (review: Review) => void) => void
    onRatingUpdated: (callback: (data: { ProductId: string; NewRating: number; ReviewCount: number }) => void) => void
    onReviewLikeUpdated: (callback: (data: { ReviewId: string; LikeCount: number }) => void) => void
    onUserTyping: (callback: (data: { UserId: string; UserName: string; IsTyping: boolean; ProductId: string }) => void) => void
    // B4 FIX: Expose off* methods để component có thể cleanup đúng handler specific hoặc purge
    offNewReview: (callback?: (review: Review) => void) => void
    offRatingUpdated: (callback?: (data: { ProductId: string; NewRating: number; ReviewCount: number }) => void) => void
    offReviewLikeUpdated: (callback?: (data: { ReviewId: string; LikeCount: number }) => void) => void
    offUserTyping: (callback?: (data: { UserId: string; UserName: string; IsTyping: boolean; ProductId: string }) => void) => void
    // Handlers for notifications
    onReceiveNotification: (callback: (type: string, payload: unknown) => void) => void
    offReceiveNotification: (callback?: (type: string, payload: unknown) => void) => void
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined)

interface SignalRProviderProps {
    children: ReactNode
}

export function SignalRProvider({ children }: SignalRProviderProps) {
    // ReviewHub state & refs
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const connectionRef = useRef<signalR.HubConnection | null>(null)
    const isConnectingRef = useRef(false)

    // NotificationHub state & refs
    const [notificationConnection, setNotificationConnection] = useState<signalR.HubConnection | null>(null)
    const [isNotificationConnected, setIsNotificationConnected] = useState(false)
    const notificationConnectionRef = useRef<signalR.HubConnection | null>(null)
    const isNotifConnectingRef = useRef(false)

    const { isAuthenticated } = useAuth()

    // Use same-origin /api (proxied to backend) for cookie-based auth
    const getBaseUrl = () => '/api'

    // Helper to get CSRF token
    const getCsrfToken = () => {
        if (typeof document === 'undefined') return undefined
        const match = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrf_token='))
        return match?.split('=')[1]
    }

    // Setup ReviewHub
    useEffect(() => {
        if (!isAuthenticated) {
            setIsConnected(false)
            setConnection(null)
            return
        }

        let isCancelled = false
        const baseUrl = getBaseUrl();
        const csrfToken = getCsrfToken();
        const headers: Record<string, string> = {};
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        }

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/reviewHub`, {
                transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
                withCredentials: true,
                headers: headers
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    if (retryContext.elapsedMilliseconds < 60000) {
                        return Math.random() * 10000
                    } else {
                        return null
                    }
                }
            })
            .configureLogging(signalR.LogLevel.Information)
            .build()

        const startConnection = async () => {
            if (isConnectingRef.current) return
            isConnectingRef.current = true
            try {
                if (newConnection.state === signalR.HubConnectionState.Disconnected) {
                    await newConnection.start()
                }
                if (isCancelled) {
                    if (
                        newConnection.state === signalR.HubConnectionState.Connected ||
                        newConnection.state === signalR.HubConnectionState.Connecting
                    ) {
                        await newConnection.stop().catch(() => {})
                    }
                    return
                }
                logger.debug('SignalR ReviewHub Connected')
                setIsConnected(true)
            } catch (err) {
                if (!isCancelled) {
                    logger.error('SignalR ReviewHub Connection Error: ', err)
                    setIsConnected(false)
                }
            } finally {
                isConnectingRef.current = false
            }
        }

        newConnection.onclose((error) => {
            if (!isCancelled) {
                logger.debug('SignalR ReviewHub Connection Closed', error)
                setIsConnected(false)
            }
        })

        newConnection.onreconnecting((error) => {
            if (!isCancelled) {
                logger.debug('SignalR ReviewHub Reconnecting', error)
                setIsConnected(false)
            }
        })

        newConnection.onreconnected((connectionId) => {
            if (!isCancelled) {
                logger.debug('SignalR ReviewHub Reconnected', connectionId)
                setIsConnected(true)
            }
        })

        connectionRef.current = newConnection
        setConnection(newConnection)
        startConnection()

        return () => {
            isCancelled = true
            setIsConnected(false)
            if (connectionRef.current) {
                if (
                    connectionRef.current.state === signalR.HubConnectionState.Connected ||
                    connectionRef.current.state === signalR.HubConnectionState.Connecting
                ) {
                    connectionRef.current.stop().catch(() => {})
                }
                connectionRef.current = null
            }
            setConnection(null)
        }
    }, [isAuthenticated])

    // Setup NotificationHub
    useEffect(() => {
        if (!isAuthenticated) {
            setIsNotificationConnected(false)
            setNotificationConnection(null)
            if (notificationConnectionRef.current) {
                notificationConnectionRef.current.stop().catch(() => {})
                notificationConnectionRef.current = null
            }
            return
        }

        let isCancelled = false
        const baseUrl = getBaseUrl();
        const csrfToken = getCsrfToken();
        const headers: Record<string, string> = {};
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        }

        const newNotifConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/notification-hub`, { // Correct endpoint per Program.cs
                transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
                withCredentials: true,
                headers: headers
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build()

        const startNotifConnection = async () => {
            if (isNotifConnectingRef.current) return
            isNotifConnectingRef.current = true
            try {
                if (newNotifConnection.state === signalR.HubConnectionState.Disconnected) {
                    await newNotifConnection.start()
                }
                if (isCancelled) {
                    if (
                        newNotifConnection.state === signalR.HubConnectionState.Connected ||
                        newNotifConnection.state === signalR.HubConnectionState.Connecting
                    ) {
                        await newNotifConnection.stop().catch(() => {})
                    }
                    return
                }
                logger.debug('SignalR NotificationHub Connected')
                setIsNotificationConnected(true)
            } catch (err) {
                if (!isCancelled) {
                    logger.error('SignalR NotificationHub Connection Error: ', err)
                    setIsNotificationConnected(false)
                }
            } finally {
                isNotifConnectingRef.current = false
            }
        }

        newNotifConnection.onclose((error) => {
            if (!isCancelled) {
                logger.debug('SignalR NotificationHub Connection Closed', error)
                setIsNotificationConnected(false)
            }
        })

        notificationConnectionRef.current = newNotifConnection
        setNotificationConnection(newNotifConnection)
        startNotifConnection()

        return () => {
            isCancelled = true
            setIsNotificationConnected(false)
            if (notificationConnectionRef.current) {
                if (
                    notificationConnectionRef.current.state === signalR.HubConnectionState.Connected ||
                    notificationConnectionRef.current.state === signalR.HubConnectionState.Connecting
                ) {
                    notificationConnectionRef.current.stop().catch(() => {})
                }
                notificationConnectionRef.current = null
            }
            setNotificationConnection(null)
        }
    }, [isAuthenticated])

    const joinProductGroup = useCallback(async (productId: string) => {
        const conn = connectionRef.current
        if (conn && conn.state === signalR.HubConnectionState.Connected) {
            try {
                await conn.invoke('JoinProductGroup', productId)
                logger.debug(`Joined product group: ${productId}`)
            } catch (err) {
                logger.error('Error joining product group:', err)
            }
        }
    }, [])

    const leaveProductGroup = useCallback(async (productId: string) => {
        const conn = connectionRef.current
        if (conn && conn.state === signalR.HubConnectionState.Connected) {
            try {
                await conn.invoke('LeaveProductGroup', productId)
                logger.debug(`Left product group: ${productId}`)
            } catch (err) {
                logger.error('Error leaving product group:', err)
            }
        }
    }, [])

    const sendTypingIndicator = useCallback(async (productId: string, isTyping: boolean) => {
        const conn = connectionRef.current
        if (conn && conn.state === signalR.HubConnectionState.Connected) {
            try {
                await conn.invoke('SendTypingIndicator', productId, isTyping)
            } catch (err) {
                logger.error('Error sending typing indicator:', err)
            }
        }
    }, [])

    const onNewReview = useCallback((callback: (review: Review) => void) => {
        connectionRef.current?.on('NewReview', callback)
    }, [])

    const onRatingUpdated = useCallback((callback: (data: { ProductId: string; NewRating: number; ReviewCount: number }) => void) => {
        connectionRef.current?.on('RatingUpdated', callback)
    }, [])

    const onReviewLikeUpdated = useCallback((callback: (data: { ReviewId: string; LikeCount: number }) => void) => {
        connectionRef.current?.on('ReviewLikeUpdated', callback)
    }, [])

    const onUserTyping = useCallback((callback: (data: { UserId: string; UserName: string; IsTyping: boolean; ProductId: string }) => void) => {
        connectionRef.current?.on('UserTyping', callback)
    }, [])

    const onReceiveNotification = useCallback((callback: (type: string, payload: unknown) => void) => {
        notificationConnectionRef.current?.on('ReceiveNotification', callback)
    }, [])

    // Off methods with specific callback or purge fallback
    const offNewReview = useCallback((callback?: (review: Review) => void) => {
        if (!connectionRef.current) return
        if (callback) {
            connectionRef.current.off('NewReview', callback)
        } else {
            connectionRef.current.off('NewReview')
        }
    }, [])

    const offRatingUpdated = useCallback((callback?: (data: { ProductId: string; NewRating: number; ReviewCount: number }) => void) => {
        if (!connectionRef.current) return
        if (callback) {
            connectionRef.current.off('RatingUpdated', callback)
        } else {
            connectionRef.current.off('RatingUpdated')
        }
    }, [])

    const offReviewLikeUpdated = useCallback((callback?: (data: { ReviewId: string; LikeCount: number }) => void) => {
        if (!connectionRef.current) return
        if (callback) {
            connectionRef.current.off('ReviewLikeUpdated', callback)
        } else {
            connectionRef.current.off('ReviewLikeUpdated')
        }
    }, [])

    const offUserTyping = useCallback((callback?: (data: { UserId: string; UserName: string; IsTyping: boolean; ProductId: string }) => void) => {
        if (!connectionRef.current) return
        if (callback) {
            connectionRef.current.off('UserTyping', callback)
        } else {
            connectionRef.current.off('UserTyping')
        }
    }, [])

    const offReceiveNotification = useCallback((callback?: (type: string, payload: unknown) => void) => {
        if (!notificationConnectionRef.current) return
        if (callback) {
            notificationConnectionRef.current.off('ReceiveNotification', callback)
        } else {
            notificationConnectionRef.current.off('ReceiveNotification')
        }
    }, [])

    const value = useMemo<SignalRContextType>(() => ({
        connection,
        notificationConnection,
        isConnected,
        isNotificationConnected,
        joinProductGroup,
        leaveProductGroup,
        sendTypingIndicator,
        onNewReview,
        onRatingUpdated,
        onReviewLikeUpdated,
        onUserTyping,
        offNewReview,
        offRatingUpdated,
        offReviewLikeUpdated,
        offUserTyping,
        onReceiveNotification,
        offReceiveNotification,
    }), [
        connection,
        notificationConnection,
        isConnected,
        isNotificationConnected,
        joinProductGroup,
        leaveProductGroup,
        sendTypingIndicator,
        onNewReview,
        onRatingUpdated,
        onReviewLikeUpdated,
        onUserTyping,
        offNewReview,
        offRatingUpdated,
        offReviewLikeUpdated,
        offUserTyping,
        onReceiveNotification,
        offReceiveNotification,
    ])

    return (
        <SignalRContext.Provider value={value}>
            {children}
        </SignalRContext.Provider>
    )
}

export function useSignalR() {
    const context = useContext(SignalRContext)
    if (context === undefined) {
        throw new Error('useSignalR must be used within a SignalRProvider')
    }
    return context
}
