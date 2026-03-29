import type { MarqueeData } from '@/types/marquee'
import MarqueeBarClient from './MarqueeBarClient'

export default async function MarqueeBar() {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:5000/api'
        const res = await fetch(
            `${apiUrl}/marquee`,
            { next: { revalidate: 300 } }
        )
        if (!res.ok) return null

        const data: MarqueeData = await res.json()
        if (!data.isEnabled || !data.messages?.length) return null

        return <MarqueeBarClient messages={data.messages} />
    } catch {
        return null
    }
}
