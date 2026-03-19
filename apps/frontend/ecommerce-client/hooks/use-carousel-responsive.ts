"use client"

import { useState, useEffect } from "react"

type BreakpointConfig<T> = {
    xs?: T // mobile (< 640px)
    sm?: T // small screens (>= 640px)
    md?: T // medium screens (>= 768px)
    lg?: T // large screens (>= 1024px)
    xl?: T // extra large screens (>= 1280px)
    "2xl"?: T // 2x extra large screens (>= 1536px)
}

const breakpoints = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
}

export function useCarouselResponsive<T>(config: BreakpointConfig<T>, defaultValue: T) {
    const [value, setValue] = useState<T>(defaultValue)

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth

            if (width >= breakpoints["2xl"] && config["2xl"] !== undefined) {
                setValue(config["2xl"])
            } else if (width >= breakpoints.xl && config.xl !== undefined) {
                setValue(config.xl)
            } else if (width >= breakpoints.lg && config.lg !== undefined) {
                setValue(config.lg)
            } else if (width >= breakpoints.md && config.md !== undefined) {
                setValue(config.md)
            } else if (width >= breakpoints.sm && config.sm !== undefined) {
                setValue(config.sm)
            } else if (config.xs !== undefined) {
                setValue(config.xs)
            } else {
                setValue(defaultValue)
            }
        }

        // Initial call
        handleResize()

        // Add event listener
        window.addEventListener("resize", handleResize)

        // Cleanup
        return () => window.removeEventListener("resize", handleResize)
    }, [config, defaultValue])

    return value
}

