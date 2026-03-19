# ShopViet UI/UX Dark Mode Audit Report

**Date:** 08/01/2026  
**Scope:** Desktop UI - Dark Mode  
**Stack:** Next.js + TailwindCSS + shadcn/ui  
**Reviewer:** Senior UI/UX Auditor & Design System Reviewer

---

## Executive Summary

### Critical Issues (P0)
- **Checkout forms unusable** - Severe contrast failure (gray text on gray/white backgrounds)
- **Hybrid dark mode** - Order Summary cards hard-coded to white background
- **Missing surface hierarchy** - Background/Card/Popover use nearly identical dark values

### High Priority Issues (P1)
- **Incorrect primary color usage** - Orange (#FF6B00) creates "discount store" impression, not premium tech
- **Primary foreground error** - Dark text on blue primary in dark mode (readability failure)
- **Weak borders** - Product cards lack clear boundaries

---

## Design System Foundation

### Color Token Architecture (shadcn/ui)

**REQUIRED dark mode configuration:**

```css
.dark {
  /* Surface Hierarchy - CRITICAL */
  --background: 240 10% 3.9%;      /* #09090b - Base */
  --card: 240 10% 8%;              /* #18181b - Elevated +4% */
  --popover: 240 10% 10%;          /* #1f1f23 - Highest +6% */
  
  /* Foreground */
  --foreground: 0 0% 98%;          /* #fafafa */
  --card-foreground: 0 0% 98%;
  --popover-foreground: 0 0% 98%;
  
  /* Primary - Tech Blue */
  --primary: 217.2 91.2% 59.8%;    /* #3b82f6 */
  --primary-foreground: 0 0% 100%; /* #ffffff - WHITE REQUIRED */
  
  /* Muted */
  --muted: 240 3.7% 15.9%;         /* #27272a */
  --muted-foreground: 240 5% 64.9%; /* #a1a1aa */
  
  /* Accent */
  --accent: 240 3.7% 15.9%;        /* #27272a */
  --accent-foreground: 0 0% 98%;
  
  /* Border & Input */
  --border: 240 3.7% 15.9%;        /* #27272a */
  --input: 240 3.7% 15.9%;
  --ring: 217.2 91.2% 59.8%;       /* Match primary */
  
  /* Destructive */
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
}
```

### Surface Hierarchy Rules (MANDATORY)

| Element | Utility Class | Token Value | Notes |
|---------|--------------|-------------|-------|
| Page background | `bg-background` | `240 10% 3.9%` | Darkest |
| Cards / Sections | `bg-card` + `border-border/20` | `240 10% 8%` | +4% lighter |
| Hover state | `bg-accent` | `240 3.7% 15.9%` | Interactive feedback |
| Popover / Dropdown | `bg-popover` + `shadow-lg` | `240 10% 10%` | +6% lighter |
| Modal / Dialog | `bg-popover` + `shadow-xl` | `240 10% 10%` | Highest elevation |

**Critical Rule:** NEVER manually set dark values. Always use semantic tokens.

---

## Primary Color Usage Rules

### ✅ ALLOWED for Primary

- Primary CTA buttons: "Mua ngay", "Tiến hành thanh toán", "Xác nhận"
- Active states: Active tab, selected filter
- Final total in Order Summary (emphasis on complete amount)
- Focus rings (`ring-primary`)

### ❌ FORBIDDEN for Primary

- Product prices (in listing or detail pages)
- Labels or body text
- Decorative elements
- Non-critical action buttons

**Rationale:** Overuse dilutes CTA effectiveness. Price should use `text-foreground` or `text-cyan-400` for tech aesthetic.

---

## Critical Issues Detail

### P0-1: Checkout Form Inputs (UNUSABLE)

**Impact:** Users cannot read or fill forms in dark mode  
**Root Cause:** Components not using shadcn/ui dark mode tokens  

**Required Fix:**

```tsx
// Label
<Label className="text-foreground font-medium">Họ và tên</Label>

// Input
<Input 
  className="bg-input border-input text-foreground 
             placeholder:text-muted-foreground
             focus-visible:ring-ring" 
/>

// Select
<SelectTrigger className="bg-input border-input text-foreground">
  <SelectValue placeholder="Chọn tỉnh/thành phố" />
</SelectTrigger>
<SelectContent className="bg-popover border-border">
  {/* options */}
</SelectContent>
```

**⚠️ Note:** Only use `bg-input` and `border-input` if these tokens are mapped in `tailwind.config`. If not mapped, use `bg-background` and `border-border`.

**Definition of Done:**
- [ ] All form labels readable (WCAG AA contrast ≥ 4.5:1)
- [ ] Form inputs clearly visible against background
- [ ] Placeholder text distinguishable
- [ ] Focus states have visible rings

---

### P0-2: Hard-coded White Backgrounds

**Impact:** UI "broken", inconsistent dark mode  
**Root Cause:** Components using `bg-white` instead of semantic tokens  

**Affected:** Cart Order Summary, Checkout Order Summary

**Required Fix:**

```tsx
// ❌ WRONG
<div className="bg-white text-gray-900">

// ✅ CORRECT
<div className="bg-card text-card-foreground border border-border/20">
```

**Quick Audit Command:**
```bash
# Find all hard-coded light mode classes
grep -r "bg-white\|bg-gray-50\|bg-gray-100\|text-gray-900\|text-gray-700" app/
```

**Definition of Done:**
- [ ] Zero instances of `bg-white`, `bg-gray-50`, `bg-gray-100` in components
- [ ] All cards use `bg-card text-card-foreground`
- [ ] Visual consistency across all pages

---

### P0-3: Primary Foreground Token Error

**Impact:** Buttons with dark text on blue background (poor readability)  
**Root Cause:** Incorrect `--primary-foreground` value  

**Current (WRONG):**
```css
--primary: 217.2 91.2% 59.8%;    /* #3b82f6 blue */
--primary-foreground: 222.2 47.4% 11.2%; /* #1e293b dark - FAILS CONTRAST */
```

**Required (CORRECT):**
```css
--primary: 217.2 91.2% 59.8%;    /* #3b82f6 */
--primary-foreground: 0 0% 100%; /* #ffffff - WHITE */
```

**Definition of Done:**
- [ ] Primary buttons have white text
- [ ] Contrast ratio ≥ 4.5:1 (WCAG AA)
- [ ] All button variants use correct foreground tokens

---

## High Priority Issues

### P1-1: Product Card Borders

**Impact:** Cards blend into background, lack visual definition  
**Root Cause:** Missing or insufficient border styling  

**Required Fix:**

```tsx
<div className="bg-card border border-border/20 rounded-lg 
                hover:border-border/40 transition-colors">
  {/* card content */}
</div>
```

**Do NOT use:** Custom border colors like `border-gray-800`. Always use `border-border` with opacity.

---

### P1-2: Incorrect Price Color

**Impact:** Orange prices create "discount store" impression  
**Root Cause:** Misuse of primary color for non-CTA elements  

**Required Fix:**

```tsx
// ❌ WRONG
<span className="text-orange-500 text-2xl font-bold">
  33.990.000 ₫
</span>

// ✅ CORRECT Option 1 (Neutral)
<span className="text-foreground text-2xl font-bold">
  33.990.000 ₫
</span>

// ✅ CORRECT Option 2 (Tech accent)
<span className="text-cyan-400 text-2xl font-bold">
  33.990.000 ₫
</span>
```

**Definition of Done:**
- [ ] Zero instances of `text-orange-*` for prices
- [ ] Prices use `text-foreground` or `text-cyan-400`
- [ ] Primary color reserved for CTAs only

---

### P1-3: CTA Hierarchy Inversion

**Impact:** Secondary actions more prominent than primary  
**Location:** Product Detail page  

**Current (WRONG):**
- "Mua ngay" = Ghost/Outline (barely visible)
- "Thêm vào giỏ" = Orange solid (most prominent)

**Required (CORRECT):**

```tsx
<div className="flex gap-3">
  {/* Primary CTA */}
  <Button 
    size="lg" 
    className="flex-1 bg-primary text-primary-foreground 
               hover:bg-primary/90 shadow-lg shadow-primary/20"
  >
    Mua ngay
  </Button>
  
  {/* Secondary CTA */}
  <Button 
    size="lg" 
    variant="outline"
    className="flex-1 border-border/40 hover:bg-accent"
  >
    Thêm vào giỏ hàng
  </Button>
</div>
```

---

## Image Issues (Separated by Type)

### UI Issue: Missing Image Fallback

**Type:** Component implementation  
**Impact:** Broken image icons displayed  
**Root Cause:** No error handling for failed image loads  

**Required Fix:**

Create `components/ui/image-with-fallback.tsx`:

```tsx
'use client'

import Image, { ImageProps } from 'next/image'
import { Package } from 'lucide-react'
import { useState } from 'react'

export function ImageWithFallback({ 
  src, 
  alt, 
  ...props 
}: ImageProps) {
  const [error, setError] = useState(false)
  
  if (error || !src) {
    return (
      <div className="flex items-center justify-center bg-muted">
        <Package className="w-12 h-12 text-muted-foreground" />
      </div>
    )
  }
  
  return (
    <Image 
      src={src} 
      alt={alt} 
      onError={() => setError(true)}
      {...props} 
    />
  )
}
```

### Data Issue: Incorrect Seed Images

**Type:** Backend/API data mapping  
**Impact:** Cartoon images instead of product photos  
**Root Cause:** API returning wrong image URLs  

**NOT a UI fix.** Report to backend team.

---

## Typography & Spacing

### Text Hierarchy

| Element | Class | Rationale |
|---------|-------|-----------|
| Page heading | `text-foreground text-3xl font-bold` | Maximum contrast |
| Section heading | `text-foreground text-xl font-semibold` | Clear hierarchy |
| Product name | `text-foreground font-medium` | Readable, not dominant |
| Body text | `text-muted-foreground` | Reduced emphasis |
| Disabled text | `text-muted-foreground/50` | Clear disabled state |

**Rule:** NEVER use arbitrary gray values like `text-gray-700`. Always use semantic tokens.

---

## Definition of Done for Dark Mode

### Visual Consistency
- [ ] No white/light backgrounds in any component
- [ ] All text readable against backgrounds (WCAG AA minimum)
- [ ] Border opacity consistent (typically `/20` for resting, `/40` for hover)
- [ ] Surface hierarchy visible (background → card → popover)

### Color Tokens
- [ ] Primary = `#3b82f6` (blue)
- [ ] Primary foreground = `#ffffff` (white)
- [ ] No hard-coded colors (all use CSS variables)
- [ ] Orange removed from pricing and CTAs

### Components
- [ ] All forms usable in dark mode
- [ ] Focus states visible (`ring-ring`)
- [ ] Hover states provide clear feedback
- [ ] Buttons use correct variant hierarchy

### Testing
- [ ] Test all pages with theme toggle
- [ ] Verify no light mode "flash" on load
- [ ] Check browser zoom 100-200%
- [ ] Test keyboard navigation visibility

---

## Quick Audit Checklist

Run these searches to find common dark mode errors:

```bash
# Hard-coded light backgrounds
grep -r "bg-white\|bg-gray-50\|bg-gray-100" app/ components/

# Hard-coded text colors (should use tokens)
grep -r "text-gray-900\|text-gray-700\|text-gray-600" app/ components/

# Orange usage (should be blue primary)
grep -r "orange-500\|orange-600" app/ components/

# Border without opacity (too harsh)
grep -r 'border-border"' app/ components/  # Missing /20 or /40
```

**Expected result:** Zero matches after fixes applied.

---

## Implementation Priority

### Sprint 1 (Week 1) - P0 Critical Bugs

| Task | File(s) | Effort | Impact |
|------|---------|--------|--------|
| Fix checkout form inputs | `app/checkout/page.tsx`, `components/ui/input.tsx` | 30min | 🔴 Critical |
| Fix white Order Summary cards | `components/cart/order-summary.tsx` | 15min | 🔴 Critical |
| Update primary-foreground token | `app/globals.css` | 5min | 🔴 Critical |

**Sprint 1 Total:** ~1 hour  
**Outcome:** Dark mode functional and usable

---

### Sprint 2 (Week 1-2) - P1 High Impact

| Task | File(s) | Effort | Impact |
|------|---------|--------|--------|
| Update all color tokens | `app/globals.css` | 20min | 🟠 High |
| Add borders to product cards | `components/product/product-card.tsx` | 20min | 🟠 High |
| Fix price colors (remove orange) | All product components | 30min | 🟠 High |
| Fix CTA hierarchy | `app/products/[id]/page.tsx` | 15min | 🟠 High |
| Remove hard-coded grays | Global search & replace | 30min | 🟠 High |

**Sprint 2 Total:** ~2 hours  
**Outcome:** Professional, consistent dark mode

---

### Sprint 3 (Week 2) - P2 Polish

| Task | Effort |
|------|--------|
| Add image fallback component | 30min |
| Implement micro-interactions | 1hr |
| Add backdrop-blur to header | 20min |
| Button shadows | 20min |

**Sprint 3 Total:** ~2.5 hours  
**Outcome:** Premium polish

---

## Component Quick Reference

### Button Variants

```tsx
// Primary CTA
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">

// Secondary
<Button variant="outline" className="border-border/40 hover:bg-accent">

// Destructive
<Button variant="destructive">

// Ghost
<Button variant="ghost" className="hover:bg-accent">
```

### Card Pattern

```tsx
<div className="bg-card text-card-foreground border border-border/20 rounded-lg">
  {/* content */}
</div>
```

### Input Pattern

```tsx
<div className="space-y-2">
  <Label className="text-foreground">Label</Label>
  <Input 
    className="bg-input border-input text-foreground 
               placeholder:text-muted-foreground" 
  />
</div>
```

---

## Technical Notes

### Token Mapping Verification

If `bg-input` or `border-input` fail, verify `tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      // ... etc
    }
  }
}
```

All shadcn/ui tokens must be mapped. If `input` is missing, add it or use `background` as fallback.

---

## Validation Criteria

### Pre-Deployment Checklist

**Visual:**
- [ ] Toggle theme - no white elements appear in dark mode
- [ ] All text readable at normal and zoomed levels
- [ ] Borders visible but not harsh
- [ ] Cards have clear elevation hierarchy

**Code Quality:**
- [ ] Zero hard-coded colors in JSX
- [ ] All components use semantic tokens
- [ ] No `text-gray-*` or `bg-gray-*` except in `globals.css`
- [ ] Consistent border opacity pattern

**Accessibility:**
- [ ] Contrast ratios pass WCAG AA (4.5:1 text, 3:1 UI components)
- [ ] Focus indicators visible
- [ ] Form labels associated with inputs

---

## References

- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [shadcn/ui Dark Mode](https://ui.shadcn.com/docs/dark-mode)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

## Screenshots Reference

Existing screenshots document current issues:

- [Homepage](./screenshots/homepage_dark_initial_1767872492730.png)
- [Product List](./screenshots/product_list_dark_1767872513838.png)
- [Product Detail](./screenshots/product_detail_dark_1767872562659.png)
- [Cart](./screenshots/cart_page_dark_1767872577594.png)
- [Checkout](./screenshots/checkout_page_dark_1767872594031.png)

---

**End of Audit Report**
