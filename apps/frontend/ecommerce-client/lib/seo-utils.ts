import { Metadata } from "next"

interface SeoMetadataInput {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: "website" | "article" | "product"
  author?: string
  publishedDate?: string
  updatedDate?: string
}

interface ProductMetadataInput extends SeoMetadataInput {
  price?: number
  currency?: string
  brand?: string
  category?: string
  rating?: number
  reviewCount?: number
  availability?: "InStock" | "OutOfStock" | "PreOrder"
  sku?: string
}

/**
 * Generate consistent metadata for pages
 */
export function generatePageMetadata(input: SeoMetadataInput): Metadata {
  const {
    title,
    description,
    keywords = [],
    image,
    url = `https://shopviet.com`,
    type = "website",
  } = input

  return {
    title,
    description,
    keywords: ["ShopViet", ...keywords].filter(Boolean),
    openGraph: {
      title,
      description,
      type: type === "article" ? "article" : "website",
      url,
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  }
}

/**
 * Generate metadata for product pages with structured data
 */
export function generateProductMetadata(input: ProductMetadataInput): Metadata {
  const baseMetadata = generatePageMetadata(input)

  return {
    ...baseMetadata,
    openGraph: baseMetadata.openGraph,
  }
}

/**
 * Generate metadata for category/collection pages
 */
export function generateCategoryMetadata(
  categoryName: string,
  description: string,
  itemCount?: number,
  image?: string
): Metadata {
  return generatePageMetadata({
    title: `${categoryName} - ShopViet`,
    description,
    keywords: [categoryName, "mua hàng online", "thương mại điện tử"],
    image,
    url: `https://shopviet.com/categories/${categoryName.toLowerCase().replace(/\s+/g, "-")}`,
  })
}

/**
 * Generate JSON-LD structured data for products
 */
export function generateProductSchema(data: {
  name: string
  description: string
  price: number
  currency?: string
  image?: string
  rating?: number
  reviewCount?: number
  brand?: string
  sku?: string
  availability?: "InStock" | "OutOfStock" | "PreOrder"
  url?: string
}) {
  const {
    name,
    description,
    price,
    currency = "VND",
    image,
    rating,
    reviewCount = 0,
    brand,
    sku,
    availability = "InStock",
    url = "https://shopviet.com",
  } = data

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name,
    description,
    image,
    brand: {
      "@type": "Brand",
      name: brand || "ShopViet",
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price: price.toString(),
      availability: `https://schema.org/${availability}`,
    },
    ...(sku && { sku }),
    ...(rating &&
      reviewCount > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: rating.toString(),
          reviewCount: reviewCount.toString(),
        },
      }),
  }
}

/**
 * Generate JSON-LD structured data for breadcrumbs
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: (index + 1).toString(),
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ShopViet",
    url: "https://shopviet.com",
    logo: "https://shopviet.com/logo.png",
    description: "Nền tảng thương mại điện tử hàng đầu Việt Nam",
    sameAs: [
      "https://www.facebook.com/shopviet",
      "https://www.instagram.com/shopviet",
      "https://twitter.com/shopviet",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      telephone: "+84-xxx-xxx-xxxx",
      email: "support@shopviet.com",
    },
  }
}

/**
 * Get canonical URL for a page
 */
export function getCanonicalUrl(path: string): string {
  return `https://shopviet.com${path.startsWith("/") ? "" : "/"}${path}`
}

/**
 * Sanitize title to reasonable length for SEO (50-60 chars)
 */
export function sanitizeTitle(title: string, maxLength = 60): string {
  return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title
}

/**
 * Sanitize description to reasonable length (150-160 chars)
 */
export function sanitizeDescription(description: string, maxLength = 160): string {
  const cleaned = description.replace(/\s+/g, " ").trim()
  return cleaned.length > maxLength ? `${cleaned.substring(0, maxLength)}...` : cleaned
}

/**
 * Generate a slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]/g, "")
    .replace(/\-+/g, "-")
    .trim()
}
