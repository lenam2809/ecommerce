/**
 * Google OAuth helpers — CHỈ dành cho ecommerce-client (không dùng ở dashboard).
 *
 * Flow (đồng bộ với backend AuthController):
 *  1. Người dùng bấm "Đăng nhập với Google" → form POST tới `/api/auth/external-login`
 *     (Next.js rewrite proxy sang backend `${NEXT_PUBLIC_API_URL}/api/auth/external-login`).
 *  2. Backend trả về Challenge → trình duyệt redirect sang Google.
 *  3. Google callback về `/api/auth/google-response` → backend tạo/liên kết tài khoản,
 *     set cookie httpOnly (access_token + refresh_token) rồi redirect về
 *     `${AppUrl:Frontend}/auth/google-callback?returnUrl=<path>`.
 *  4. Trang callback gọi `GET /api/auth/cookie-check` + `/api/auth/me/profile`,
 *     cập nhật AuthContext rồi điều hướng về `returnUrl`.
 *
 * Lưu ý kỹ thuật:
 *  - Endpoint backend là POST (`[HttpPost("external-login")]`) → phải dùng form POST,
 *    không được điều hướng bằng GET (sẽ trả 405 Method Not Allowed).
 *  - Backend `NormalizeReturnUrl` CHỈ chấp nhận path tương đối (bắt đầu "/", không phải
 *    "//", không chứa "\"). URL tuyệt đối (ví dụ `window.location.origin`) sẽ bị
 *    normalize thành "/" → mất intent "quay lại trang hiện tại".
 *  - Gọi qua `/api` same-origin (không gọi thẳng NEXT_PUBLIC_API_URL) để Next.js proxy
 *    sang backend và cookie được set trên domain của frontend — đúng thiết kế cookie
 *    của app (xem lib/api.ts và next.config.ts rewrites).
 */

const GOOGLE_PROVIDER = "Google"

/**
 * Có hiển thị nút "Đăng nhập với Google" không?
 *  - Nếu NEXT_PUBLIC_APP_TYPE được set và KHÁC "client" → ẩn (chống lọt vào dashboard).
 *  - Nếu NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN === "false" → ẩn (kill switch khi Google OAuth
 *    chưa được cấu hình ở backend).
 */
export function isGoogleLoginEnabled(): boolean {
    const appType = process.env.NEXT_PUBLIC_APP_TYPE

    if (appType && appType !== "client") {
        return false
    }

    return process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN !== "false"
}

/**
 * Chuẩn hóa returnUrl về path tương đối an toàn (phòng open-redirect),
 * khớp với quy tắc `NormalizeReturnUrl` của backend.
 */
export function normalizeReturnUrlPath(returnUrl: string | null | undefined): string {
    if (!returnUrl) {
        return "/"
    }

    try {
        const decoded = decodeURIComponent(returnUrl)

        if (decoded.startsWith("/") && !decoded.startsWith("//") && !decoded.includes("\\")) {
            return decoded
        }
    } catch {
        // URL malformed → fallback bên dưới
    }

    return "/"
}

/**
 * Build URL form action cho external-login.
 * Same-origin `/api/...` → Next.js rewrite proxy sang backend.
 * `returnUrl` phải là path tương đối (ví dụ "/", "/checkout").
 */
export function buildGoogleLoginUrl(returnUrl: string): string {
    const safeReturnUrl = normalizeReturnUrlPath(returnUrl)

    return `/api/auth/external-login?provider=${GOOGLE_PROVIDER}&returnUrl=${encodeURIComponent(safeReturnUrl)}`
}
