export interface MarqueeMessage {
    id: string
    content: string
    linkUrl?: string
    icon?: string
    speed: number
}

export interface MarqueeData {
    isEnabled: boolean
    messages: MarqueeMessage[]
}
