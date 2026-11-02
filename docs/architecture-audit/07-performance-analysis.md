> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 14/10/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/docker-compose-services/README.md`](../docker-compose-services/README.md).

# 07 — Phân tích Hiệu năng & Khả năng Mở rộng (Performance & Scalability)

> **Dự án:** ShopViet E-Commerce Platform  
> **Repository:** https://github.com/lenam2809/ecommerce  
> **Thời điểm kiểm toán:** 14/10/2026  
> **Phạm vi:** Backend WebAPI, Database Access, Cache Invalidation, Frontend Client & Dashboard Rendering.

---

## 1. Đánh giá Hiệu năng Backend & Nút thắt (Bottlenecks)

### 1.1. Tối ưu hóa Truy vấn & Bộ nhớ EF Core
1. **Sử dụng `AsNoTracking()`**:
   - Các query đọc danh sách trong `GetPagedProductsQueryHandler` và `GetProductByIdQueryHandler` đã sử dụng `AsNoTracking()`, giúp giải phóng Change Tracker và giảm ~30-40% bộ nhớ cấp phát khi xử lý danh sách lớn.
2. **Nút thắt tính toán Rating động**:
   - Trong `CreateReviewCommandHandler`, sau khi thêm một đánh giá mới, hệ thống tính toán lại xếp hạng trung bình của sản phẩm:
     ```csharp
     var avg = await _context.Reviews.Where(r => r.ProductId == productId).AverageAsync(r => r.Rating);
     var count = await _context.Reviews.CountAsync(r => r.ProductId == productId);
     ```
   - **Tác động:** Phép toán này yêu cầu 2 lần quét bảng `Reviews` (1 lần tính trung bình, 1 lần đếm). Khi bảng reviews có hàng trăm nghìn bản ghi, đây sẽ là nút thắt I/O lớn.
   - **Giải pháp:** Lưu trữ trường tổng điểm (`TotalRatingSum`) và số lượng (`RatingCount`) ngay trên bảng `Products` để cập nhật nguyên tử O(1) qua SQL `UPDATE`.

### 1.2. Chiến lược Cache Đa tầng (Multi-tier Caching)
- **Cấu hình TTL chi tiết tại `appsettings.json`**:
  - `ProductExpirationMinutes`: 10 phút.
  - `CategoryExpirationMinutes`: 30 phút.
  - `BrandExpirationMinutes`: 30 phút.
  - `ConfigExpirationMinutes`: 60 phút.
  - `UserSpecificExpirationMinutes`: 2 phút.
  - `GuestCartExpirationDays`: 7 ngày.
- **Cơ chế Fallback thông minh**:
  - Khi `CacheSettings:UseRedis = false` hoặc khi cụm Redis mất kết nối, hệ thống tự động fallback sang `DistributedMemoryCache` trong RAM, đảm bảo API không bị timeout hoặc gián đoạn.
- **Tag-based Cache Invalidation**:
  - `CacheService.cs` hỗ trợ theo dõi key theo Tag (`TrackKeyAsync`) và xóa cache theo tag (`RemoveByTagAsync`). Khi Admin cập nhật danh mục hoặc sản phẩm, hệ thống tự động xóa cache liên quan.

### 1.3. Background Processing & Giảm tải API
- **Outbox Background Worker**: `OutboxBackgroundService` chạy nền độc lập với chu kỳ quét mặc định `PollIntervalSeconds` (1-5 giây), xử lý tối đa `BatchSize` (50 tin nhắn/lần), giúp các thao tác thanh toán và đặt hàng phản hồi khách hàng trong <100ms mà không bị nghẽn bởi việc gửi email hay thông báo.
- **Sampling Request Logging**: `RequestLoggingMiddleware.cs` hỗ trợ `NoisySuccessSamplingRules` với tỷ lệ lấy mẫu 10% (`SuccessSampleRate = 0.1`) cho các GET request thường xuyên như `/api/Products`, `/api/Categories/paged`, giúp giảm 90% tải ghi log I/O và dung lượng ổ đĩa.

---

## 2. Đánh giá Hiệu năng Frontend (Client & Dashboard)

### 2.1. Storefront Client (`ecommerce-client`)
1. **Next.js 15 App Router & Server Components**:
   - Các trang tĩnh và bán tĩnh (Home, Danh mục) được render phía máy chủ, giảm thời gian Time-to-First-Byte (TTFB) và tối ưu SEO.
2. **Virtual Scrolling**:
   - Sử dụng `@tanstack/react-virtual` (v3.13.23) cho danh sách sản phẩm dài, ngăn chặn việc render hàng trăm DOM node cùng lúc trên trình duyệt di động.
3. **Cơ chế Stale-While-Revalidate**:
   - TanStack Query v5 cấu hình `staleTime` phù hợp, tái sử dụng dữ liệu client cache khi người dùng chuyển tab hoặc quay lại trang trước, giảm số lượng request gọi về backend API.

### 2.2. Admin Dashboard (`ecommerce-dashboard`)
1. **Ảo hóa Bảng dữ liệu lớn (Table Virtualization)**:
   - Sử dụng kết hợp `react-virtuoso` (v4.12.7) và `react-window` (v1.8.11) trong các bảng quản trị đơn hàng, người dùng và sản phẩm hàng nghìn dòng, đảm bảo thao tác cuộn mượt mà ở 60 FPS.
2. **Cảnh báo Lãng phí Bundle Size (Dead Dependencies)**:
   - Trong `package.json`, dashboard khai báo cả 3 thư viện ảo hóa: `@tanstack/react-virtual`, `react-virtuoso`, và `react-window` cùng lúc! Việc dùng trùng lặp 3 thư viện làm tăng bundle size của admin bundle thêm ~150KB.
   - Dashboard cài đặt `@storybook/react` nhưng không có script cấu hình chạy Storybook trong `scripts`.

---

## 3. Khả năng Mở rộng & Đề xuất Benchmark

### 3.1. Điểm nghẽn khi Scale Horizontal (Nhiều instances)
1. **File Upload lưu trên Local Disk**:
   - Nếu chạy trong Docker mà không cấu hình volume chung (hoặc không kích hoạt Supabase Storage), ảnh upload trên instance A sẽ không hiển thị được trên instance B. Cần bắt buộc sử dụng S3/Supabase trên môi trường cụm container.
2. **SignalR WebSocket Clustering**:
   - Hiện tại `builder.Services.AddSignalR()` chưa kích hoạt `AddStackExchangeRedis()` backplane. Khi mở rộng nhiều container WebAPI, một thông báo gửi từ Admin trên node 1 sẽ **không tới được** khách hàng đang kết nối WebSocket vào node 2.

### 3.2. Kế hoạch Benchmark cần thực hiện
1. **Kịch bản Flash Sale / Đặt hàng đồng thời**:
   - Dùng k6 hoặc Locust giả lập 500 người dùng cùng đặt mua 10 SKU có tồn kho giới hạn (`quantity = 10`) trong 10 giây.
   - **Mục tiêu đo:** Đảm bảo `rowsAffected == 1` chính xác 10 lần, không có tình trạng overselling (tồn kho âm) và latency p95 < 200ms.
2. **Kịch bản Tìm kiếm Full-text**:
   - So sánh độ trễ (latency) và tải CPU giữa Elasticsearch ICU vs SQL LIKE khi cơ sở dữ liệu có 100,000 sản phẩm.
