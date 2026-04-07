/**
 * Analytics utility for tracking user behavior and events
 * Supports multiple analytics providers (GA4, custom events, etc.)
 */

export type EventName =
  | "page_view"
  | "product_view"
  | "product_click"
  | "add_to_cart"
  | "remove_from_cart"
  | "view_cart"
  | "begin_checkout"
  | "add_payment_info"
  | "purchase"
  | "search"
  | "filter_applied"
  | "sort_applied"
  | "wishlist_add"
  | "wishlist_remove"
  | "user_signup"
  | "user_login"
  | "user_logout"
  | "share_product"
  | "contact_form_submit"

export interface EventData {
  [key: string]: string | number | boolean | undefined
}

export interface ProductData {
  id: string
  name: string
  price: number
  brand?: string
  category?: string
  variant?: string
  quantity?: number
  discount?: number
}

export interface PageViewData {
  path: string
  title: string
  referrer?: string
}

export interface CheckoutData {
  value: number
  currency: string
  items: ProductData[]
  coupon?: string
}

class Analytics {
  private isEnabled: boolean = false
  private debugMode: boolean = false

  constructor() {
    this.isEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true"
    this.debugMode = process.env.NODE_ENV === "development"
  }

  /**
   * Initialize analytics
   */
  init() {
    if (!this.isEnabled) {
      if (this.debugMode) {
        console.log("[Analytics] Analytics is disabled")
      }
      return
    }

    // Initialize Google Analytics if gtag is available
    if (typeof window !== "undefined" && (window as any).gtag) {
      if (this.debugMode) {
        console.log("[Analytics] Google Analytics initialized")
      }
    }
  }

  /**
   * Track a page view
   */
  trackPageView(data: PageViewData) {
    if (!this.isEnabled) return

    const eventData = {
      page_path: data.path,
      page_title: data.title,
      referrer: data.referrer,
    }

    this.sendEvent("page_view", eventData)
  }

  /**
   * Track product view
   */
  trackProductView(product: ProductData) {
    if (!this.isEnabled) return

    const eventData = {
      value: product.price,
      currency: "VND",
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_brand: product.brand,
          item_category: product.category,
          price: product.price,
        },
      ],
    }

    this.sendEvent("view_item", eventData)
  }

  /**
   * Track product click/interaction
   */
  trackProductClick(product: ProductData, source?: string) {
    if (!this.isEnabled) return

    const eventData = {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      product_brand: product.brand,
      product_category: product.category,
      source: source || "product_list",
    }

    this.sendEvent("product_click", eventData)
  }

  /**
   * Track add to cart
   */
  trackAddToCart(product: ProductData, quantity: number = 1) {
    if (!this.isEnabled) return

    const eventData = {
      value: product.price * quantity,
      currency: "VND",
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_brand: product.brand,
          item_category: product.category,
          price: product.price,
          quantity,
        },
      ],
    }

    this.sendEvent("add_to_cart", eventData)
  }

  /**
   * Track remove from cart
   */
  trackRemoveFromCart(product: ProductData, quantity: number = 1) {
    if (!this.isEnabled) return

    const eventData = {
      value: product.price * quantity,
      currency: "VND",
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          quantity,
        },
      ],
    }

    this.sendEvent("remove_from_cart", eventData)
  }

  /**
   * Track view cart
   */
  trackViewCart(products: ProductData[], total: number) {
    if (!this.isEnabled) return

    const eventData = {
      value: total,
      currency: "VND",
      items: products.map((p) => ({
        item_id: p.id,
        item_name: p.name,
        item_brand: p.brand,
        item_category: p.category,
        price: p.price,
        quantity: p.quantity || 1,
      })),
    }

    this.sendEvent("view_cart", eventData)
  }

  /**
   * Track begin checkout
   */
  trackBeginCheckout(data: CheckoutData) {
    if (!this.isEnabled) return

    const eventData = {
      value: data.value,
      currency: data.currency,
      coupon: data.coupon,
      items: data.items.map((p) => ({
        item_id: p.id,
        item_name: p.name,
        item_brand: p.brand,
        item_category: p.category,
        price: p.price,
        quantity: p.quantity || 1,
      })),
    }

    this.sendEvent("begin_checkout", eventData)
  }

  /**
   * Track purchase
   */
  trackPurchase(data: CheckoutData, transactionId: string) {
    if (!this.isEnabled) return

    const eventData = {
      transaction_id: transactionId,
      value: data.value,
      currency: data.currency,
      coupon: data.coupon,
      items: data.items.map((p) => ({
        item_id: p.id,
        item_name: p.name,
        item_brand: p.brand,
        item_category: p.category,
        price: p.price,
        quantity: p.quantity || 1,
      })),
    }

    this.sendEvent("purchase", eventData)
  }

  /**
   * Track search
   */
  trackSearch(query: string, resultCount?: number) {
    if (!this.isEnabled) return

    const eventData = {
      search_term: query,
      result_count: resultCount,
    }

    this.sendEvent("search", eventData)
  }

  /**
   * Track filter/sort applied
   */
  trackFilterApplied(filterType: string, filterValue: string) {
    if (!this.isEnabled) return

    const eventData = {
      filter_type: filterType,
      filter_value: filterValue,
    }

    this.sendEvent("filter_applied", eventData)
  }

  /**
   * Track wishlist add
   */
  trackWishlistAdd(product: ProductData) {
    if (!this.isEnabled) return

    const eventData = {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      product_brand: product.brand,
      product_category: product.category,
    }

    this.sendEvent("wishlist_add", eventData)
  }

  /**
   * Track wishlist remove
   */
  trackWishlistRemove(product: ProductData) {
    if (!this.isEnabled) return

    const eventData = {
      product_id: product.id,
      product_name: product.name,
    }

    this.sendEvent("wishlist_remove", eventData)
  }

  /**
   * Track user authentication
   */
  trackUserAuth(event: "login" | "signup" | "logout", userId?: string) {
    if (!this.isEnabled) return

    const eventMap = {
      login: "user_login",
      signup: "user_signup",
      logout: "user_logout",
    }

    const eventData = {
      user_id: userId,
    }

    this.sendEvent(eventMap[event], eventData)
  }

  /**
   * Track contact form submission
   */
  trackContactForm(email: string, subject: string) {
    if (!this.isEnabled) return

    const eventData = {
      email,
      subject,
    }

    this.sendEvent("contact_form_submit", eventData)
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: EventName, data?: EventData) {
    if (!this.isEnabled) return
    this.sendEvent(eventName, data)
  }

  /**
   * Send event to analytics provider
   */
  private sendEvent(eventName: string, data?: EventData) {
    if (this.debugMode) {
      console.log(`[Analytics] Event: ${eventName}`, data)
    }

    // Send to Google Analytics if available
    if (typeof window !== "undefined" && (window as any).gtag) {
      try {
        (window as any).gtag("event", eventName, data)
      } catch (error) {
        console.error("[Analytics] Error sending to GA4:", error)
      }
    }

    // Send to custom backend if needed
    // Example: sendToBackend(eventName, data)
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  /**
   * Set user properties
   */
  setUserProperties(userId: string, email?: string, name?: string) {
    if (!this.isEnabled) return

    if (typeof window !== "undefined" && (window as any).gtag) {
      try {
        (window as any).gtag("config", {
          user_id: userId,
          user_properties: {
            email,
            name,
          },
        })
      } catch (error) {
        console.error("[Analytics] Error setting user properties:", error)
      }
    }
  }
}

// Export singleton instance
export const analytics = new Analytics()
