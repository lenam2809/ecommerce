"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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
    // New handler for notifications
    onReceiveNotification: (callback: (type: string, payload: any) => void) => void
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined)

interface SignalRProviderProps {
    children: ReactNode
}

export function SignalRProvider({ children }: SignalRProviderProps) {
    // ReviewHub state
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
    const [isConnected, setIsConnected] = useState(false)

    // NotificationHub state
    const [notificationConnection, setNotificationConnection] = useState<signalR.HubConnection | null>(null)
    const [isNotificationConnected, setIsNotificationConnected] = useState(false)

    const { isAuthenticated } = useAuth()

    // Helper to normalize URL (remove trailing slash)
    const getBaseUrl = () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    }

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
            return
        }

        const baseUrl = getBaseUrl();
        const csrfToken = getCsrfToken();
        const headers: any = {};
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        }

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/reviewHub`, {
                // accessTokenFactory: () => token, // No longer needed with cookies
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
            try {
                await newConnection.start()
                console.log('SignalR ReviewHub Connected')
                setIsConnected(true)
            } catch (err) {
                console.error('SignalR ReviewHub Connection Error: ', err)
                setIsConnected(false)
            }
        }

        newConnection.onclose((error) => {
            console.log('SignalR ReviewHub Connection Closed', error)
            setIsConnected(false)
        })

        newConnection.onreconnecting((error) => {
            console.log('SignalR ReviewHub Reconnecting', error)
            setIsConnected(false)
        })

        newConnection.onreconnected((connectionId) => {
            console.log('SignalR ReviewHub Reconnected', connectionId)
            setIsConnected(true)
        })

        setConnection(newConnection)
        startConnection()

        return () => {
            if (newConnection) {
                newConnection.stop()
            }
        }
    }, [isAuthenticated])

    // Setup NotificationHub
    useEffect(() => {
        if (!isAuthenticated) {
            return
        }

        const baseUrl = getBaseUrl();
        const csrfToken = getCsrfToken();
        const headers: any = {};
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        }

        const newNotifConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/notification-hub`, { // Correct endpoint per Program.cs
                // accessTokenFactory: () => token,
                transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
                withCredentials: true,
                headers: headers
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build()

        const startNotifConnection = async () => {
            try {
                await newNotifConnection.start()
                console.log('SignalR NotificationHub Connected')
                setIsNotificationConnected(true)
            } catch (err) {
                console.error('SignalR NotificationHub Connection Error: ', err)
                setIsNotificationConnected(false)
            }
        }

        newNotifConnection.onclose((error) => {
            console.log('SignalR NotificationHub Connection Closed', error)
            setIsNotificationConnected(false)
        })

        setNotificationConnection(newNotifConnection)
        startNotifConnection()

        return () => {
            if (newNotifConnection) {
                newNotifConnection.stop()
            }
        }
    }, [isAuthenticated])

    const joinProductGroup = async (productId: string) => {
        if (connection && isConnected) {
            try {
                await connection.invoke('JoinProductGroup', productId)
                console.log(`Joined product group: ${productId}`)
            } catch (err) {
                console.error('Error joining product group:', err)
            }
        }
    }

    const leaveProductGroup = async (productId: string) => {
        if (connection && isConnected) {
            try {
                await connection.invoke('LeaveProductGroup', productId)
                console.log(`Left product group: ${productId}`)
            } catch (err) {
                console.error('Error leaving product group:', err)
            }
        }
    }

    const sendTypingIndicator = async (productId: string, isTyping: boolean) => {
        if (connection && isConnected) {
            try {
                await connection.invoke('SendTypingIndicator', productId, isTyping)
            } catch (err) {
                console.error('Error sending typing indicator:', err)
            }
        }
    }

    const onNewReview = (callback: (review: Review) => void) => {
        if (connection) {
            connection.on('NewReview', callback)
        }
    }

    const onRatingUpdated = (callback: (data: { ProductId: string; NewRating: number; ReviewCount: number }) => void) => {
        if (connection) {
            connection.on('RatingUpdated', callback)
        }
    }

    const onReviewLikeUpdated = (callback: (data: { ReviewId: string; LikeCount: number }) => void) => {
        if (connection) {
            connection.on('ReviewLikeUpdated', callback)
        }
    }

    const onUserTyping = (callback: (data: { UserId: string; UserName: string; IsTyping: boolean; ProductId: string }) => void) => {
        if (connection) {
            connection.on('UserTyping', callback)
        }
    }

    const onReceiveNotification = (callback: (type: string, payload: any) => void) => {
        if (notificationConnection) {
            notificationConnection.on('ReceiveNotification', callback)
        }
    }

    const value: SignalRContextType = {
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
        onReceiveNotification,
    }

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