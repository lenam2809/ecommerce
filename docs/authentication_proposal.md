# Đề Xuất Cải Tiến Mô Hình Xác Thực E-commerce

## 1. Phân Tích Hiện Trạng & Vấn Đề

### Hiện trạng
- **Frontend**: `middleware.ts` bảo vệ các trang `/dashboard`, `/profile`.
- **Backend API**: `AddToCartCommandHandler` chặn trực tiếp nếu `UserId` null.
- **Database**: Entity `Cart` yêu cầu bắt buộc `ApplicationUserId` (Foreign Key), không hỗ trợ giỏ hàng vãng lai (Guest Cart).

### Tại sao yêu cầu đăng nhập sớm là sai lầm?
1.  **Cản trở dòng chảy mua sắm (Friction)**: Khách hàng đang trong tâm lý "xem và thêm vào giỏ". Bắt đăng nhập lúc này giống như yêu cầu xuất trình CMND ngay khi bước vào cửa siêu thị.
2.  **Tỷ lệ bỏ trang cao (Bounce Rate)**: Theo Baymard Institute, **69%** người dùng bỏ giỏ hàng, và việc "Bắt buộc tạo tài khoản" là lý do số 2 (chiếm 24%).
3.  **Mất cơ hội Guest Checkout**: Nhiều khách hàng chỉ muốn mua nhanh (Buy Now) mà không muốn nhớ thêm một mật khẩu.

## 2. Mô Hình Đề Xuất: "Lazy Registration" (Đăng ký trễ)

Chuyển từ mô hình **Hard Login** (bắt buộc ngay) sang **Guest First** (Ưu tiên khách vãng lai).

### Các cấp độ xác thực
1.  **Anonymous (Khách vãng lai)**:
    -   Được xem sản phẩm, tìm kiếm.
    -   **QUAN TRỌNG:** Được thêm vào giỏ hàng (Guest Cart).
    -   Định danh bằng `GuestId` (lưu Cookie/Local Storage).
2.  **Soft Login (Chưa cần thiết ngay)**:
    -   Nhập email ở bước Checkout để nhận thông báo đơn hàng (chưa cần password).
3.  **Authenticated (Đã đăng nhập)**:
    -   Truy cập Dashboard, Lịch sử đơn hàng, Lưu thẻ.

## 3. Ma Trận Kiểm Soát Truy Cập (Access Control Matrix)

| Trang / Chức năng | Hiện Tại | Đề Xuất | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Trang chủ / Sản phẩm** | Public | **Public** | Giữ nguyên |
| **Tìm kiếm** | Public | **Public** | Giữ nguyên |
| **Thêm vào giỏ** | **Login Required** | **Public (Guest Cart)** | *Thay đổi quan trọng nhất* |
| **Xem giỏ hàng** | **Login Required** | **Public (Guest Cart)** | Cho phép sửa/xóa item không cần login |
| **Checkout (Nhập địa chỉ)** | Login Required | **Public / Guest** | Chỉ bắt login nếu dùng mã giảm giá riêng |
| **Checkout (Thanh toán)** | Login Required | **Guest / Auth** | Guest checkout được khuyến khích |
| **Theo dõi đơn hàng** | Login Required | **Public (via Email+Order ID)** | Tra cứu đơn hàng không cần login |
| **Dashboard / Profile** | Login Required | **Login Required** | Giữ nguyên |

## 4. Luồng Người Dùng Tối Ưu (User Flow)

```mermaid
graph TD
    A[Truy cập Website] --> B(Duyệt Sản phẩm)
    B --> C{Thêm vào giỏ?}
    C -->|Yes| D[Thêm vào Guest Cart (Cookie)]
    D --> E[Xem Giỏ hàng]
    E --> F[Tiến hành Checkout]
    F --> G{Đã đăng nhập?}
    G -->|Yes| H[Điền sẵn thông tin]
    G -->|No| I[Nhập Email + Địa chỉ (Guest Checkout)]
    I --> J{Tùy chọn: Tạo tài khoản?}
    J -->|Yes| K[Nhập Password để tạo Account]
    J -->|No| L[Tiếp tục thanh toán vãng lai]
    H --> M[Thanh toán & Hoàn tất]
    K --> M
    L --> M
```

## 5. Cải Tiến Kỹ Thuật (Technical Improvements)

Để thực hiện mô hình trên, cần thay đổi Backend và Frontend như sau:

### Backend (.NET Core)
1.  **Database Migration**:
    -   Sửa bảng `Carts`: `ApplicationUserId` chuyển thành **Nullable**.
    -   Thêm cột `AnonymousId` (Guid/String, Indexed) để định danh khách vãng lai.
2.  **API Logic**:
    -   `GetCart`, `AddToCart`: Kiểm tra `UserId` trước. Nếu null, kiểm tra header `X-Guest-ID` hoặc Cookie để tìm giỏ hàng theo `AnonymousId`.
    -   **Rate Limiting**: Áp dụng giới hạn request cho các API quan trọng từ cùng 1 IP/GuestId để chống spam đơn hàng ảo.
3.  **Merge Cart Strategy**:
    -   Khi người dùng đăng nhập (`Login` success), kiểm tra xem có `AnonymousId` cookie không.
    -   Nếu có, thực hiện **Merge Cart**:
        -   **Chiến lược**: Cộng dồn số lượng (Sum Quantities) nếu sản phẩm trùng lặp.
        -   Giữ nguyên item của User nếu không trùng.
        -   Xóa Guest Cart sau khi merge thành công.

### Frontend (Next.js)
1.  **Guest ID Generation**:
    -   Khi khách vào trang lần đầu, tạo UUID (ví dụ: `uuidv4()`) lưu vào `localStorage` hoặc Cookie (`guest_id`).
    -   *Xử lý mất Cookie*: Nếu mất cookie, coi như khách mới. Chấp nhận rủi ro mất giỏ hàng vãng lai (standard behavior).
2.  **API Client**:
    -   Gửi kèm `guest_id` trong Header (ví dụ: `X-Guest-ID`) cho mọi request liên quan đến Cart/Product.
3.  **Auth State**:
    -   Cập nhật `useAuth` để không redirect ở trang Cart.
    -   Hiển thị thông báo "Bạn đã có tài khoản? Đăng nhập để tích điểm" ở trang Checkout thay vì chặn.

## 6. Bảo Mật & Mở Rộng (Security & Scalability Considerations)
> [!IMPORTANT]
> Các điểm bổ sung dựa trên feedback

1.  **Chống lạm dụng (Anti-Abuse)**:
    -   Giới hạn số lượng đơn hàng chưa thanh toán (Unpaid Orders) cho mỗi GuestId/IP (ví dụ: tối đa 3 đơn pending).
    -   Captcha ẩn (ReCaptcha v3) tại bước Checkout cho Guest.
2.  **Xác thực Email (Soft Login Verification)**:
    -   Gửi OTP xác thực email trước khi cho phép Guest Checkout hoàn tất (Phase 2).
3.  **Analytics & Tracking**:
    -   Gắn tag `Guest` vs `Registered` vào sự kiện `Purchase` để đo lường tỷ lệ chuyển đổi riêng biệt.
    -   Tracking hành vi "Add to Cart" nhưng không Checkout của Guest để chạy email marketing (nếu có email).

## 7. Quản lý Rủi ro & Vòng đời (Risk & Lifecycle Management)
1.  **Vòng đời Guest Cart**:
    -   Guest Cart sẽ có hạn sử dụng (TTL) là **30 ngày**.
    -   Sử dụng **Background Service** chạy định kỳ mỗi đêm để xóa các Guest Cart "mồ côi" (không có UserId và LastModified > 30 ngày) để tránh phình Database.
2.  **Độ phức tạp & Đánh đổi**:
    -   Chấp nhận backend phức tạp hơn (Merge logic, Cleanup job) để đổi lấy trải nghiệm người dùng tốt hơn (UX First).
    -   Chi phí này là xứng đáng vì trực tiếp tác động đến doanh thu (Conversion Rate).

## 8. Kế hoạch triển khai (Giai đoạn 1)
1.  **Backend**: Update Entity `Cart` (Nullable UserId).
2.  **Backend**: Update `CartController` & Handlers để support `AnonymousId`.
3.  **Backend Logic**: Implement `MergeCartService` (Sum strategy) & Basic Rate Limiting.
4.  **Frontend**: Xóa logic redirect ở trang Cart. Implement `GuestId` generation.
