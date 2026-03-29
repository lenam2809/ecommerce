export interface MarqueeMessage {
    id: string;
    content: string;
    linkUrl?: string | null;
    icon?: string | null;
    speed: number;
    priority: number;
    isActive: boolean;
    startDate?: string | null;
    endDate?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface MarqueeGlobalStatus {
    isEnabled: boolean;
    messages: MarqueeMessage[];
}
