/**
 * Export utilities for CSV/JSON data export
 */

import { logger } from '@/lib/logger'

/**
 * Converts array of objects to CSV string
 */
export function arrayToCSV(data: Record<string, any>[], headers?: string[]): string {
    if (data.length === 0) return ''

    // Get headers from first object if not provided
    const csvHeaders = headers || Object.keys(data[0])

    // Create header row
    const headerRow = csvHeaders.join(',')

    // Create data rows
    const dataRows = data.map((row) =>
        csvHeaders
            .map((header) => {
                const value = row[header]
                // Handle null/undefined
                if (value === null || value === undefined) return ''
                // Handle strings with commas, quotes, or newlines
                const stringValue = String(value)
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`
                }
                return stringValue
            })
            .join(',')
    )

    return [headerRow, ...dataRows].join('\n')
}

/**
 * Downloads a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

/**
 * Exports data to CSV and downloads the file
 */
export function exportToCSV<T extends Record<string, any>>(
    data: T[],
    filename: string,
    headers?: string[]
): void {
    try {
        const csv = arrayToCSV(data, headers)
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }) // BOM for Excel
        downloadBlob(blob, `${filename}.csv`)
        logger.info(`Exported ${data.length} rows to ${filename}.csv`)
    } catch (error) {
        logger.error('Failed to export CSV:', error)
        throw error
    }
}

/**
 * Exports data to JSON and downloads the file
 */
export function exportToJSON<T>(data: T, filename: string): void {
    try {
        const json = JSON.stringify(data, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        downloadBlob(blob, `${filename}.json`)
        logger.info(`Exported data to ${filename}.json`)
    } catch (error) {
        logger.error('Failed to export JSON:', error)
        throw error
    }
}

/**
 * Formats date for Vietnamese locale in filename
 */
export function formatDateForFilename(date: Date = new Date()): string {
    return date.toISOString().split('T')[0]
}

/**
 * Creates filename with date prefix
 */
export function createDatedFilename(baseName: string, date: Date = new Date()): string {
    return `${baseName}_${formatDateForFilename(date)}`
}
