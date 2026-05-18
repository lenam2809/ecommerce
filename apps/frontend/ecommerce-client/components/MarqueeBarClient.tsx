'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MarqueeMessage } from '@/types/marquee'
import { sanitizeHtmlContent } from '@/lib/sanitize-html-content'

interface Props {
    messages: MarqueeMessage[]
}

// Map speed (10–500) to slide duration in ms.
// speed=10 → ~2000ms, speed=50 → ~600ms, speed=500 → ~80ms
function slideDuration(speed: number): number {
    const s = Math.max(10, Math.min(500, speed))
    return Math.round(200 + ((500 - s) / 490) * 1800)
}

export default function MarqueeBarClient({ messages }: Props) {
    const router = useRouter()
    const [index, setIndex] = useState(0)
    // 'in' | 'hold' | 'out'
    const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const current = messages[index]
    const sd = slideDuration(current.speed)

    const advance = useCallback(() => {
        setIndex(i => (i + 1) % messages.length)
        setPhase('in')
    }, [messages.length])

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current)

        if (phase === 'in') {
            timerRef.current = setTimeout(() => setPhase('hold'), sd)
        } else if (phase === 'hold') {
            timerRef.current = setTimeout(() => setPhase('out'), 3000)
        } else {
            timerRef.current = setTimeout(advance, sd)
        }

        return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }, [phase, sd, advance])

    const translateX =
        phase === 'in' ? 'translateX(0)'
            : phase === 'hold' ? 'translateX(0)'
                : 'translateX(-100%)'

    // On mount, start offscreen so the first 'in' transition is visible
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        // One rAF delay so the browser paints the initial offscreen position
        const id = requestAnimationFrame(() => setMounted(true))
        return () => cancelAnimationFrame(id)
    }, [])

    const transform = !mounted ? 'translateX(100%)' : translateX
    const transition =
        (!mounted || phase === 'hold')
            ? 'none'
            : `transform ${sd}ms ease`

    return (
        <div
            style={{
                height: 40,
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--marquee-bg, #1a1a1a)',
                color: 'var(--marquee-color, #fff)',
                fontSize: 14,
            }}
        >
            <div
                key={index}
                style={{
                    position: 'absolute',
                    width: '100%',
                    textAlign: 'center',
                    transform,
                    transition,
                    cursor: current.linkUrl ? 'pointer' : 'default',
                    padding: '0 16px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
                onClick={() => current.linkUrl && router.push(current.linkUrl)}
                dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(current.content) }}
            />
        </div>
    )
}
