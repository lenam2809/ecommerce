Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# Ecommerce Dashboard Frontend

This document provides context for AI assistants working on the `ecommerce-dashboard` project.

## Tech Stack & Purpose
- **Framework:** Next.js 15 (App Router, standalone output)
- **Language & Runtime:** TypeScript, React 18.3.1 (Note: React 18, not React 19)
- **Styling:** Tailwind CSS v4 (with Cold Slate & Deep Obsidian design tokens)
- **UI & Components:** Radix UI primitives, `@tanstack/react-table` v8, Recharts, Lucide React, `@dnd-kit`
- **State & Data:** `@tanstack/react-query` v5, Axios, `react-hook-form` + Zod
- **Default Port:** 3001 (`http://localhost:3001`)
- **Total Screens/Routes:** 71 routes
- **Purpose:** A robust administrative dashboard for the ShopViet e-commerce platform.

## Key Development Commands
Run these commands using `npm` (or `yarn`/`pnpm` depending on your manager):
- `npm run dev` - Start development server (Next.js, runs on port 3001)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run typecheck` - Run TypeScript compiler checks

## Directory Structure & Entry Points
- `/app` - Next.js App Router pages and layouts (71 routes total):
  - `/(auth)` - Authentication routes (`login`, `forgot-password`).
  - `/(dashboard)` - Protected dashboard routes:
    - User & Access Control: `dashboard`, `account`, `users` (list, new, detail, edit, permissions), `roles` (list, new, detail, edit, permissions), `permissions` (list, new, detail, edit), `account-locks` (`/account-locks` - view locks and lock/unlock user accounts).
    - Catalog & Inventory: `products` (list, new, detail, edit), `bulk-management/products`, `categories`, `brands`, `inventory` (`/inventory` - IMEI/Serial batch import, tracking & reservation), `showrooms` (`/showrooms` - branch showroom network and local stock management).
    - Orders & RMA: `orders` (list, new, detail, edit), `returns` (`/returns` - RMA return & exchange management, review/approval workflow).
    - Marketing & Configurations: `configs/banners`, `configs/flash-sales`, `configs/marquee` (`/configs/marquee` - emergency & promotional marquee text ticker), `configs/promo-codes`, `configs/product-addons` (`/configs/product-addons` - extended warranties & bundled accessory add-ons), `settings`.
    - Reports & System Logs: `reports/orders`, `reports/products`, `reports/revenue`, `reports/users`, `logs` (list, detail), `user-activities`, `notifications`, `about`, `contact`, `help`.
- `/components` - Reusable React components:
  - `/ui` - Base UI primitives (shadcn/ui style components).
  - `/generic` - Highly reusable complex components (`generic-list.tsx`, `data-table.tsx`).
- `/services` - API client wrappers organized by feature (`auth-service.ts`, `product-service.ts`, `order-service.ts`, `inventory-service.ts`, `showroom-service.ts`, `return-service.ts`, `marquee-service.ts`, `account-lock-service.ts`, `product-addon-service.ts`, etc.).
- `/lib` - Core utilities, `axios` interceptors, `session-sync.ts`, and error handling.
- `/types` - TypeScript type definitions.
- `/schemas` - Zod validation schemas.
- `middleware.ts` - Edge middleware for route protection (checks for `access_token` cookie).
- `next.config.ts` - Contains API rewrites (`/api/:path*` -> backend) and image domain configurations.

## Code Conventions
- **Component Design:** Prefer using existing generic components (like `GenericList` and `DataTable`) for listing pages over building new ones from scratch.
- **API Communication:** Use the predefined service classes in `/services` built on top of the configured `axios` instance for API calls.
- **Form Handling:** Always use `react-hook-form` paired with `zod` schema resolvers for robust form validation.
- **UI & Styling Guidelines:** Adhere to SSoT 2026 tokens. Always use `.price-tag` or `font-mono tabular-nums whitespace-nowrap` for currency display. Use `bg-brand` (`#E11D48`) for sale conversion actions, `bg-tech-blue` (`#2563EB`) for technical/interactive controls. Never hardcode hex codes.

## Special Notes / "Gotchas"
- **API Rewrites:** Development and client API calls to `/api/...` are rewritten in `next.config.ts` to `NEXT_PUBLIC_API_URL` (defaulting to `http://localhost:5000/api`). Be mindful of this when debugging network requests.
- **Authentication Strategy:** Auth tokens (`access_token`) are stored in HttpOnly cookies (15 min browser lifetime). The `middleware.ts` checks token presence to protect `/dashboard` routes.
- **Order Status Update Missing RowVersion:** Backend `UpdateOrderStatusCommand` requires `RowVersion` to prevent concurrent modification race conditions. Currently, `services/order-service.ts:updateStatus` sends `{ status, expectedDeliveryDate }` without `rowVersion`. Always ensure `rowVersion` is passed when working with order status transitions.
- **Generic List:** The `/components/generic/generic-list.tsx` is heavily used for server-side paginated data tables. When adding a new management page, leverage this component.
