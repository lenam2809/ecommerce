"use client"

import { usePathname } from "next/navigation"
import { breadcrumbConfig } from "@/config/breadcrumb-config"
export type BreadcrumbItem = {
    label: string
    href: string
    isCurrent?: boolean
}

// Default path segment labels
const defaultPathLabels: Record<string, string> = {
    "": "Home",
    dashboard: "Dashboard",
    products: "Products",
    users: "Users",
    settings: "Settings",
    profile: "Profile",
    analytics: "Analytics",
}

/**
 * Generates breadcrumb items based on the current path
 * @param useConfig Whether to use the configuration-based breadcrumbs
 */
export function useBreadcrumbs(useConfig = true): BreadcrumbItem[] {
    const pathname = usePathname()

    // Use configuration-based breadcrumbs if enabled
    if (useConfig) {
        return getConfigBreadcrumbs(pathname)
    }

    // Otherwise, use path-based breadcrumbs
    return getPathBreadcrumbs(pathname)
}

/**
 * Generates breadcrumbs based on the configuration
 */
function getConfigBreadcrumbs(pathname: string): BreadcrumbItem[] {
    // If the exact path is not in the config, try to find the closest match
    let currentPath = pathname
    while (currentPath && !breadcrumbConfig.paths[currentPath]) {
        // Remove the last segment
        currentPath = currentPath.substring(0, currentPath.lastIndexOf("/"))
    }

    // If no match found, fall back to path-based breadcrumbs
    if (!currentPath) {
        return getPathBreadcrumbs(pathname)
    }

    const breadcrumbs: BreadcrumbItem[] = []
    let path = currentPath

    // Build the breadcrumb chain by following parent references
    while (path) {
        const config = breadcrumbConfig.paths[path]
        if (!config) break

        breadcrumbs.unshift({
            label: config.label,
            href: path,
            isCurrent: path === pathname,
        })

        path = config.parent || ""
    }

    // If the exact path wasn't in the config, add the missing segments
    if (currentPath !== pathname) {
        const remainingSegments = pathname.substring(currentPath.length).split("/").filter(Boolean)
        let buildPath = currentPath

        remainingSegments.forEach((segment) => {
            buildPath += `/${segment}`
            const isLast = buildPath === pathname

            breadcrumbs.push({
                label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
                href: isLast ? "#" : buildPath,
                isCurrent: isLast,
            })
        })
    }

    return breadcrumbs
}

/**
 * Generates breadcrumbs based on the path structure
 */
function getPathBreadcrumbs(pathname: string): BreadcrumbItem[] {
    // Skip generating breadcrumbs for the home page
    if (pathname === "/") {
        return [{ label: "Home", href: "/", isCurrent: true }]
    }

    // Split the pathname into segments and remove empty segments
    const segments = pathname.split("/").filter(Boolean)

    // Generate breadcrumb items
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }]

    // Build up the breadcrumb path segments
    let currentPath = ""

    segments.forEach((segment, index) => {
        currentPath += `/${segment}`
        const isLast = index === segments.length - 1

        // Use the custom label from the map if available, otherwise capitalize the segment
        const label = defaultPathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")

        breadcrumbs.push({
            label,
            href: isLast ? "#" : currentPath,
            isCurrent: isLast,
        })
    })

    return breadcrumbs
}
