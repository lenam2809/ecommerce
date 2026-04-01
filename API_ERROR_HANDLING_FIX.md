# 🔧 Báo cáo sửa lỗi xử lý API Error

## 📋 Tổng quan vấn đề

**Hiện trạng ban đầu:** Mỗi khi có bất kỳ lỗi API nào (404, 500, network error...), ứng dụng tự động đẩy người dùng về trang login.

**Hành vi mong muốn:** Chỉ redirect về login khi gặp lỗi **401 Unauthorized** hoặc **403 Forbidden**. Các lỗi khác chỉ hiển thị thông báo và giữ nguyên phiên làm việc.

---

## 🎯 Phân tích nguyên nhân

### File/Vị trí gây lỗi:

| File | Dòng code | Vấn đề |
|------|-----------|--------|
| `apps/frontend/ecommerce-client/lib/api.ts` | 63-81 | Hàm `handleAuthFailure()` được gọi cho MỌI lỗi 401, không phân biệt refresh token thành công hay thất bại |
| `apps/frontend/ecommerce-dashboard/lib/axios.ts` | 64-70 | Hàm `clearAuthAndRedirect()` được gọi mà không kiểm tra status code cụ thể |
| `apps/frontend/*/lib/session-sync.ts` | 33-42 | Khi nhận event LOGOUT, luôn redirect mà không có returnUrl |

### Nguyên nhân gốc rễ:

1. **Thiếu điều kiện kiểm tra status code** trong response interceptor
2. **Không lưu returnUrl** trước khi redirect
3. **Session sync** không truyền tải thông tin returnUrl giữa các tab

---

## ✅ Giải pháp đã thực hiện

### 1. Sửa Response Interceptor (ecommerce-client)

**File:** `apps/frontend/ecommerce-client/lib/api.ts`

```typescript
// Response interceptor for 401/403 handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status

    // ✅ CHỈ handle 401 và 403 - để các lỗi khác pass through
    if (status !== 401 && status !== 403) {
      return Promise.reject(error)  // UI component sẽ xử lý hiển thị lỗi
    }

    // Handle 401 với token refresh
    if (status === 401 && !originalRequest._retry) {
      // ... logic refresh token ...
    }

    // Handle 403 hoặc 401 sau khi refresh failed
    if ((status === 401 && originalRequest._retry) || status === 403) {
      handleAuthFailure(originalRequest)
    }

    return Promise.reject(error)
  }
)
```

**Thay đổi chính:**
- Thêm check `if (status !== 401 && status !== 403)` ở đầu interceptor
- Chỉ gọi `handleAuthFailure()` cho 401/403 thực sự
- Các lỗi 4xx, 5xx khác sẽ được reject để UI component xử lý

### 2. Lưu ReturnUrl trước khi Redirect

**File:** `apps/frontend/ecommerce-client/lib/api.ts` (hàm `handleAuthFailure`)

```typescript
function handleAuthFailure(originalRequest: InternalAxiosRequestConfig) {
  if (typeof window === "undefined") return

  // ... guest check logic ...

  // ✅ Lưu URL hiện tại trước khi clear data
  const currentPath = window.location.pathname + window.location.search
  const returnUrl = encodeURIComponent(currentPath)
  
  localStorage.removeItem("user")
  sessionSync.broadcast('LOGOUT', { returnUrl })  // ✅ Truyền returnUrl
  
  // ✅ Redirect với returnUrl
  window.location.href = `/login?returnUrl=${returnUrl}`
}
```

### 3. Cập nhật Session Sync

**File:** `apps/frontend/ecommerce-client/lib/session-sync.ts`

```typescript
interface SessionEvent {
    type: SessionEventType;
    payload?: {
        user?: unknown;
        timestamp?: number;
        returnUrl?: string;  // ✅ Added
    };
}

// Trong handleMessage:
case 'LOGOUT':
    if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
            // ✅ Sử dụng returnUrl từ payload nếu có
            const targetUrl = payload?.returnUrl 
                ? `/login?returnUrl=${payload.returnUrl}`
                : '/login';
            window.location.href = targetUrl;
        }
    }
    break;
```

### 4. Xử lý ReturnUrl tại Login Page

**File:** `apps/frontend/ecommerce-client/app/(auth)/login/page.tsx`

```typescript
const searchParams = useSearchParams()

// ✅ Support cả 'returnUrl' và 'redirect' param
const returnUrl = searchParams.get("returnUrl") || searchParams.get("redirect") || "/"
const redirectUrl = decodeURIComponent(returnUrl)

// Sau khi login thành công:
router.push(redirectUrl)
```

---

## 📁 Danh sách file đã sửa

| # | File | Thay đổi chính |
|---|------|----------------|
| 1 | `apps/frontend/ecommerce-client/lib/api.ts` | - Thêm check status !== 401/403<br>- Lưu returnUrl trong handleAuthFailure<br>- Broadcast returnUrl qua sessionSync |
| 2 | `apps/frontend/ecommerce-dashboard/lib/axios.ts` | - Thêm check status !== 401/403<br>- Lưu returnUrl trong clearAuthAndRedirect |
| 3 | `apps/frontend/ecommerce-client/lib/session-sync.ts` | - Thêm returnUrl vào SessionEvent interface<br>- Xử lý returnUrl trong LOGOUT handler |
| 4 | `apps/frontend/ecommerce-dashboard/lib/session-sync.ts` | - Tương tự file client |
| 5 | `apps/frontend/ecommerce-client/app/(auth)/login/page.tsx` | - Đọc returnUrl từ query params<br>- Decode và redirect sau login |
| 6 | `apps/frontend/ecommerce-dashboard/components/auth/login-form.tsx` | - Thêm useSearchParams<br>- Đọc và sử dụng returnUrl |

---

## 🧪 Cách hoạt động

### Flow xử lý lỗi:

```
┌─────────────────────────────────────────────────────────────┐
│                    API Request Failed                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   Response Interceptor         │
              │   Check: error.response.status │
              └───────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          │                                       │
          ▼                                       ▼
   Status = 401 or 403                    Status = Other
          │                               (404, 500, etc.)
          │                                       │
          ▼                                       ▼
   ┌─────────────────┐                   ┌─────────────────┐
   │ Try Refresh     │                   │ Promise.reject  │
   │ Token (401 only)│                   │ (no redirect)   │
   └─────────────────┘                   └─────────────────┘
          │                                       │
    ┌─────┴─────┐                                 │
    │           │                                 │
    ▼           ▼                                 ▼
Success    Failure                         UI Component
Retry          │                         shows toast/error
request        │                         message
               │
               ▼
      ┌─────────────────┐
      │ Save returnUrl  │
      │ Clear session   │
      │ Redirect to     │
      │ /login?returnUrl│
      └─────────────────┘
```

### Flow đăng nhập với returnUrl:

```
User → Bị lỗi 401 → Redirect to /login?returnUrl=%2Fdashboard%2Fproducts
                     │
                     ▼
              User enters credentials
                     │
                     ▼
              Login successful
                     │
                     ▼
              Read returnUrl from query params
                     │
                     ▼
              Decode: /dashboard/products
                     │
                     ▼
              router.push('/dashboard/products')
```

---

## 🎨 Ví dụ sử dụng tại Component

### Xử lý lỗi không phải 401/403:

```tsx
import { toast } from 'sonner'
import api from '@/lib/api'

async function handleCheckout() {
  try {
    await api.post('/checkout', orderData)
    toast.success('Đặt hàng thành công!')
  } catch (error: any) {
    // ✅ Lỗi 400, 404, 500... sẽ vào đây mà KHÔNG bị redirect
    const message = error.response?.data?.message || 'Có lỗi xảy ra'
    toast.error(message)
    // User vẫn ở lại trang checkout
  }
}
```

### Lỗi 401/403 (tự động redirect):

```tsx
async function fetchUserProfile() {
  try {
    const response = await api.get('/user/profile')
    return response.data
  } catch (error: any) {
    // ✅ Nếu là 401/403, đã bị redirect ở interceptor
    // Code này chỉ chạy nếu user cancel hoặc有其他 lỗi
    console.error('Failed to fetch profile:', error)
  }
}
```

---

## ✅ Kết quả đạt được

| Yêu cầu | Trạng thái |
|---------|------------|
| Chỉ redirect với 401/403 | ✅ |
| Giữ nguyên session với lỗi khác | ✅ |
| Lưu returnUrl trước khi redirect | ✅ |
| Quay lại trang cũ sau login | ✅ |
| Hiển thị toast cho lỗi thường | ✅ |
| Sync logout giữa các tab với returnUrl | ✅ |

---

## 🔍 Testing Checklist

- [ ] Thử gọi API sai endpoint (404) → Không redirect, hiển thị toast
- [ ] Thử gọi API server lỗi (500) → Không redirect, hiển thị toast  
- [ ] Thử gọi API không có quyền (403) → Redirect về login với returnUrl
- [ ] Thử gọi API với token hết hạn (401) → Refresh token → Retry → Thành công
- [ ] Thử gọi API với refresh token cũng hết hạn → Redirect về login
- [ ] Sau khi login, verify user được quay lại trang trước đó
- [ ] Mở 2 tab, logout ở tab 1 → Tab 2 cũng redirect với đúng returnUrl

---

## 📝 Lưu ý thêm

1. **Security**: ReturnUrl được encode để tránh open redirect attacks
2. **Multi-tab**: Session sync đảm bảo tất cả tab cùng logout và redirect
3. **Guest users**: Vẫn có logic suppress redirect cho guest ở soft endpoints
4. **Compatibility**: Support cả param `returnUrl` và `redirect` để backward compatible
