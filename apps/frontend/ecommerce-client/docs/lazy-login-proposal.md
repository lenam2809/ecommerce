# Đề xuất Cải tiến: Lazy Login & Guest Cart

Dựa trên phân tích mã nguồn và yêu cầu "Chỉ yêu cầu đăng nhập khi cần thông tin khách hàng", tài liệu này đề xuất giải pháp kỹ thuật để cải thiện trải nghiệm người dùng (UX) bằng cách cho phép khách vãng lai (Guest) thao tác nhiều hơn trước khi bắt buộc đăng nhập.

## 1. Vấn đề hiện tại
- **Chặn sớm**: Trang `/checkout` hiện tại redirect ngay về `/login` nếu chưa có token, gây ngắt quãng trải nghiệm mua hàng.
- **Phụ thuộc Backend**: `useCart` gọi trực tiếp API. Nếu chưa đăng nhập, các API này (thường yêu cầu Auth) sẽ lỗi hoặc trả về rỗng, khiến Guest không thể dùng giỏ hàng.
- **Rào cản**: Khách hàng mới phải đăng ký/đăng nhập ngay từ đầu mới được thêm hàng vào giỏ, làm giảm tỷ lệ chuyển đổi (CRO).

## 2. Giải pháp đề xuất: "Lazy Login" Flow

Cho phép người dùng thực hiện toàn bộ hành trình Mua sắm -> Giỏ hàng -> Checkout mà chưa cần đăng nhập. Bước xác thực chỉ diễn ra **ngay trước khi hoàn tất đặt hàng** hoặc được lồng ghép vào quy trình nhập thông tin giao hàng.

### A. Guest Cart (Giỏ hàng Offline)
**Mục tiêu**: Cho phép Guest thêm/sửa/xóa sản phẩm trong giỏ hàng mà không cần gọi API.

**Kỹ thuật**:
1.  **LocalStorage Adapter**: Sửa `use-cart.ts`.
    -   Kiểm tra `user` (hoặc token).
    -   Nếu **Có User**: Gọi API Backend như cũ.
    -   Nếu **Không User**: Lưu/Đọc `items` từ `localStorage`.
    -   Cấu trúc dữ liệu Local phải tương thích với `Cart` type.
2.  **Cart Sync (Đồng bộ)**:
    -   Khi User thực hiện **Login** thành công.
    -   Tự động bắn request trộn (merge) giỏ hàng Local lên Server.
    -   Xóa giỏ hàng Local sau khi sync xong.

### B. Trì hoãn Đăng nhập tại Checkout
**Mục tiêu**: Cho phép Guest vào trang Checkout, điền thông tin và xem phí ship mà không bị chặn.

**Kỹ thuật**:
1.  **Bỏ Redirect**: Xóa `useEffect` redirect tại `checkout/page.tsx`.
2.  **Form thông minh**:
    -   Hiển thị form nhập thông tin (Tên, SDT, Email, Địa chỉ) cho tất cả mọi người.
    -   Nếu User đã login: Tự điền (Auto-fill) như hiện tại.
    -   Nếu Guest: Cho phép nhập tự do.
3.  **Xử lý nút "Đặt hàng"**:
    -   Khi bấm "Đặt hàng", kiểm tra trạng thái đăng nhập.
    -   **Kịch bản 1 (Có tài khoản)**:
        -   Kiểm tra Email khác đã tồn tại trong hệ thống? -> Yêu cầu nhập mật khẩu để link đơn hàng (Login tại chỗ).
    -   **Kịch bản 2 (Chưa có tài khoản - Auto Register)**:
        -   Hệ thống tự động tạo tài khoản ngầm (với mật khẩu random hoặc yêu cầu Guest nhập thêm mật khẩu) VÀ thực hiện đặt hàng trong 1 transaction.
        -   API `auth/register-and-order` (Cần Backend hỗ trợ) hoặc Client gọi `register` -> `login` -> `createOrder`.

## 3. Kế hoạch Thực thi (Client-Side Focus)

Do chúng ta giới hạn sửa đổi ở Client (repo hiện tại), giải pháp tối ưu nhất là **Client-side Interception**:

1.  **Cải tiến `store/use-cart`**:
    -   Thêm logic `persist` (dùng `zustand/middleware/persist` hoặc custom hook) để quản lý `localCart`.
    -   Viết wrapper function cho `addToCart`: `!isAuth ? addToLocal() : addToServer()`.

2.  **Sửa trang `checkout/page.tsx`**:
    -   Thay thế logic check Auth cứng.
    -   Thêm Dialog/Modal "Đăng nhập nhanh" khi bấm hoàn tất đơn hàng nếu là Guest.
    -   Hoặc thêm trường "Mật khẩu" (Optional) ngay trong form Checkout để Đăng ký & Đặt hàng cùng lúc.

3.  **Flow UX mới**:
    `Xem SP` -> `Thêm Giỏ (Local)` -> `Vào Checkout` -> `Nhập Info` -> `Nhập Pass (Tạo TK)` -> `Hoàn tất`.

## 4. Tác động & Rủi ro
-   **Backend**: Cần API `createOrder` hỗ trợ user mới vừa tạo không bị lỗi permission khi đặt hàng ngay lập tức.
-   **Security**: Cần đảm bảo Token được set ngay sau khi đăng ký tại bước Checkout để request `createOrder` hợp lệ.

## 5. Yêu cầu phía Backend (Server-side)

Để hỗ trợ đầy đủ luồng "Lazy Login" này, Backend cần cung cấp hoặc cập nhật các API sau:

### A. API Đồng bộ Giỏ hàng (Sync Cart)
- **Endpoint**: `POST /api/cart/sync` (hoặc `merge`)
- **Mô tả**: Khi User vừa đăng nhập, Client sẽ gửi danh sách sản phẩm trong Local Cart lên. Server cần trộn (merge) danh sách này vào giỏ hàng hiện tại của User trong Database.
- **Logic merge**: Cộng dồn số lượng nếu trùng sản phẩm, thêm mới nếu chưa có.

### B. API Đăng ký & Đơn hàng (Atomic Register & Order) - *Tuy chọn*
- **Endpoint**: `POST /api/checkout/guest`
- **Body**: Bao gồm thông tin User (Tên, Email, Pass) VÀ thông tin Đơn hàng (Items, Address).
- **Mô tả**: Thực hiện transaction:
  1. Tạo User mới (nếu chưa tồn tại).
  2. Tạo Token và Auto-login.
  3. Tạo Đơn hàng gán cho User đó.
  4. Trả về: `{ token, orderId }`.
- **Lợi ích**: Giảm rủi ro rớt đơn hàng khi User đăng ký thành công nhưng request tạo đơn ngay sau đó bị lỗi mạng/auth.

### C. Cập nhật Permission
- Đảm bảo API `POST /api/orders` cho phép User mới tạo (vừa có Token) được quyền gọi ngay lập tức mà không bị delay do cache phân quyền (User Role Propagation).

---
**Khuyến nghị**: Nên bắt đầu với việc **Cải tiến `useCart` hỗ trợ LocalStorage** trước, vì đây là nền tảng cho mọi tính năng Guest sau này.
