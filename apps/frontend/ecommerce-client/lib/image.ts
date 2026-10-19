/**
 * Normalizes an image path/URL for Next.js <Image /> component.
 * Ensures the URL is either absolute (http://, https://) or starts with a leading slash "/".
 * Automatically maps relative backend upload paths like "products/..." to "/uploads/products/...".
 */
export function formatImageUrl(src?: string | null): string {
  if (!src || typeof src !== "string" || !src.trim()) {
    return "/placeholder.svg"
  }

  const trimmed = src.trim()

  // 1. Data URLs or Blob URLs
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed
  }

  // 2. Absolute URL (http://, https://)
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  // 3. Already starting with /uploads/
  if (trimmed.startsWith("/uploads/")) {
    return trimmed
  }

  // 4. Starts with uploads/ (missing leading slash)
  if (trimmed.startsWith("uploads/")) {
    return `/${trimmed}`
  }

  // 5. Starts with products/ or /products/ (files uploaded into backend wwwroot/uploads/products/)
  if (trimmed.startsWith("/products/")) {
    return `/uploads${trimmed}`
  }
  if (trimmed.startsWith("products/")) {
    return `/uploads/${trimmed}`
  }

  // 6. Other paths that already have a leading slash (e.g., /placeholder.svg)
  if (trimmed.startsWith("/")) {
    return trimmed
  }

  // 7. Any other relative path without leading slash
  return `/${trimmed}`
}
