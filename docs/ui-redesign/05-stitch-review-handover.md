# BÁO CÁO NGHIỆM THU THIẾT KẾ GOOGLE STITCH & BÀN GIAO THIẾT KẾ (PHASE 4 REVIEW & HANDOVER)

> **Dự án:** ShopViet E-Commerce UI/UX Redesign  
> **Phiên bản:** 1.0 (Hoàn tất toàn bộ Giai đoạn 3 — Đợt 1, 2, 3)  
> **Người thực hiện:** Design QA Lead & Principal Frontend Architect  
> **Ngày lập báo cáo:** 19/10/2026  
> **Trạng thái:** `Sẵn sàng chờ Chủ dự án phê duyệt (Pending Owner Approval)`

---

## 1. THÔNG TIN TRUY CẬP GOOGLE STITCH PROJECT

- **Tên Stitch Project:** `ShopViet E-Commerce — Hybrid Premium Tech Redesign (2026)`
- **Resource Name:** `projects/9063486193994144424`
- **Project ID (rút gọn):** `9063486193994144424`
- **Active Design System Asset:** `assets/11824505428798068962` (*ShopViet Hybrid Premium Tech*)
- **Theme Tokens áp dụng:**
  - `Color Mode`: `LIGHT` (với các khối nhấn `Dark Bento #090D16 / #111827`)
  - `Font Family`: `Plus Jakarta Sans` (kết hợp `tabular-nums` cho giá và thông số)
  - `Primary Color`: Electric Blue (`#2563EB`)
  - `Secondary Color / Action CTA`: Tech Crimson (`#E11D48`)
  - `Tertiary Accent`: Deep Obsidian (`#090D16`)
  - `Neutral Accent`: Slate Gray (`#64748B`)
- **Trạng thái Codebase:** `100% nguyên vẹn` — Không có bất kỳ file nào trong thư mục `apps/` bị chỉnh sửa hay thay đổi.

---

## 2. BẢNG ĐỐI CHIẾU MÀN HÌNH (100% RECONCILIATION MATRIX)

Đối chiếu toàn bộ 18 màn hình đã sinh qua 3 Đợt thiết kế (3A, 3B, 3C) với hệ thống route thực tế của `apps/frontend/ecommerce-client`:

| Mã Đợt | Mã MH | Tên màn hình / Luồng nghiệp vụ | Route (`ecommerce-client`) | Viewport | Stitch Screen ID (Refactored) | Trạng thái | Xem Screenshot | Chi tiết Tinh chỉnh & SSoT 2026 |
|---|---|---|---|---|---|---|---|---|
| **Đợt 1** | **D1-01 (MH-01D)** | Trang chủ — Hybrid Bento Showcase | `/` | Desktop (1440px) | `ec3e4924095742a49034ab4fccb69e24` | `Refactored (SSoT)` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1Xd2j7q5C7rKH4j3Ya2FqCUaDjceJ8jmZoAqPLiUsjsVj1zF-9zca0r3c6qmCjESab8147PCMIPbPnzrusDztr6YAW-dot16tyh1f7VIcXCRPYDHyHXFMODdPaodsVBQ048cmphsjbXiWKgNJlO-6nirKE4pd6Udo6WMe9Y8wlAsXNjSF5XxNJKqSrShuChiJGD4aAv5R0hYZuyROS_r9c4TGm6RUbByU37GoM1GQ_cXP81lzban2PHmd8) | Ẩn search mặc định, countdown Flash Sale, max 2 spec chips, gradient VIP/Footer, 45 Showroom, iPhone 16 PM 34.990.000đ. |
| **Đợt 1** | **D1-02 (MH-01M)** | Trang chủ — Tối ưu màn hình dọc di động | `/` | Mobile (390px) | `7ad5b771c3874e6bb40284b94fba39c9` | `Refactored (SSoT)` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1XCUBo_ElRkofSZ0r3lqIC1RY8v5CHRWMcRcoSMR8IHva558OMR7vu2FTK6i749IOxvrFKPKhqIp83wO_qy4mOwuyu-cDUX5POXJ5I3yC7O9-Bm_n4I_TPU1QiAs3b_WtCH_KppWTxjVWkhCkoUCjvWu4MdzOQz7lc5lhsylMbu6M2LQWn4aWhIw_x5A2fxkRwNUHy22vIzZcCntzl4hM-ma9rXURm9HI3F_VEU0ZSwF9w_d5yDKbkDlVs) | Giảm 25% hero height, nút cart tròn Slate/Blue 44x44px, active tabs rõ, footer accordion. |
| **Đợt 1** | **D1-03 (MH-02D)** | Danh sách sản phẩm + Bộ lọc Sidebar + Compare Bar | `/products`, `/products/[category]` | Desktop (1440px) | `afcb9c40f36f4c1eae9c669f56b9f2ed` | `Refactored (SSoT)` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1Wb_xUxH3AJAD3KY3FWTyqvYnavd_l6LKuSz-M2zwDn3dXkXgsWjmozQY68dHcLxCRfTSDH1Aa87e6emk8Q9oZ80O-ZcbdWyHLs7Q32sRjSxvdgsmMc_NCX8bXSJ6-7QMDJQlb9tgpcagYIchd5c0Alh_Ve3SUmUP3PEh01naoUlJocPIkuDOaX3ek46bfoGZWR_2CyV8wc4bLN5GU93F776-C2gDnsukOoMcnlyzmHKq_foqA7dunJ4fI) | Đồng bộ lưới Apple, filter RAM/SSD động, instant filter bỏ nút thừa, pb-96px & nút đóng compare bar, Flagship card dời sau hàng 2. |
| **Đợt 1** | **D1-04 (MH-02M)** | Danh sách sản phẩm + Filter Bottom Sheet | `/products`, `/products/[category]` | Mobile (390px) | `04e8f38948624b3eadd9117bd4dd28f7` | `Refactored (SSoT)` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1U0G94-HEns5ow5f1yfsEhR40PTStOJFIRFHgxApHMqJcnQ07kf1swiN63vxDami2gyRlSAzR6QpaRAyMuNRPGne9EYtIASaFoIVAgTnVLYRttyrpM9lXm9WtYbRj8u1PgJ8ilJOs1bIoSL4UEiMKK-eSSUV3dLw6b8aXUDE_AephSbiaY7PHQSoUyHOW7O2Ks9UUOFzyBv9VaU0uqZj1S4r-X9741KbN1BObYohlLcpzC2smCKntvHopk) | Filter Drawer z-index cao hơn Bottom Nav, ghim cố định cụm nút Thiết lập lại + Xem 148 KQ, bộ lọc dạng Accordion có badge count. |
| **Đợt 1** | **D1-05 (MH-03D)** | Chi tiết sản phẩm — Specs Bento & Gallery | `/product/[slug]` | Desktop (1440px) | `08fdc510028446348e257b7ba487c2eb` | `Refactored (SSoT)` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1W-rrvjAcvcscko52VaVXPtPB8h9QaYZL4qQ-YvX_vxe_RkhRLUIElPabR3SOdpetTyW8gX5aK9aB5ri7vAqXMzNiLzmFVAkKSbq_uXqfQnWPhChiHF_NWCMXJhXyrKn--hZr2PlI04oaXepSv-TdyQ3SGBxNLW_pRrX02YBEoLyTMEn38wYlpoPP6zOHIfZJnRAqjwCGcT8CcaA65TZ34ZXkEhxa76g9yycIgFqtFPVt26oD7EnVaOz5g) | Sticky Gallery + Sticky Buy Box, khối Trả góp 0%, Tồn kho 45 Showroom, checkbox AppleCare+, tabs Mô tả & Q&A, giá 61.990.000đ. |
| **Đợt 1** | **D1-06 (MH-03M)** | Chi tiết sản phẩm + Sticky Buy Bar chân trang | `/product/[slug]` | Mobile (390px) | `875bf13247634938a9506d07f2a29166` | `Refactored (SSoT)` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1W5nQHHpUe_nK6PsxnzBrTxA38-izgpLHQY9EIWYB22z6UKZGhZbdwqxUyRH2iOoU69YsFYvugnyZ18uK6EtJPboekr5NWalkVKxeUbhX81xaSSbTxBmX7GxFS7n0YStB_feFSfsfR8e7k3K6_3KgHU5RpzY2D9Y3sepq0IU4AlMUPkDHOVeVMstnY1yia5mPHXoMcSGUH07KBV63gUoFsoLQDkeBk2uE0eztCwc6hIw_OwhRgQNSy-PBg) | Gallery 35vh swipe slider, 4 thông số cốt lõi + nút xem đầy đủ, Sticky Buy Bar hiển thị variant M3 Pro 36GB/1TB Space Black thay thế Bottom Nav. |
| **Đợt 1** | **D1-07 (MH-03C)** | So sánh sản phẩm — 4 cột Specs Matrix | `/compare` | Desktop (1440px) | `9c0c0fd6205e477fbb7cf21ebbc52d80` | `Refactored (SSoT)` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1UrdGeiA_wpmGgQXS7eo3s6Zdt46n0sOOPs6vPhw9TaXat7fAWs4kZWd87B4anjoBEGUWwLzKPdka3fiio_v6nRuJr61NAhoFsIDUXy_xBva3TtfySLOh5nWdAu7moas-kSIXrvXMkkAhRjhj6u12XFFB6fLEvcyvoixcR0e0SJxrtUKeea3S_ZHZvCkcglsrkmvx_ux3KE5FBaSxPPTTqbQuxC43AoG3VZCFGVGgCh358KqXbWrPwbOnU) | Ẩn hàng giống nhau khi bật lọc khác biệt, Table hoàn chỉnh sticky header/col, placeholder thêm SP (+), badge Cao nhất/Tối ưu, nút Thêm giỏ Electric Blue. |
| **Đợt 2** | **D2-01 (MH-04D)** | Giỏ hàng — Sạch sẽ, Freeship `500.000₫` | `/cart` | Desktop (1440px) | `faaef8e3476d4181be57e3a000f9937a` | `Refactored (SSoT)` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1U6A8OLtPkyRX0m_r9Yo3KcmUm75EQ4QRMc1f8Cc4pq3n42IcdvTiyFOAO5m4V1gGZY3LDH4dwHuzqBUU2pddot8o1jYrWtY4patEkTUN9V1_TzgAFViQ9b3MgT48Z2VPVWoCo0ESM1I3aqSA2OT7A1E4QYU5MoyfsuxYMjcA0BchdZ8VmZmErjm9KDHNYaUe4l8N2-x-QzxpR3l9RfkdSQ_t6w4-nXqKHD1CQHOFeHJXHV1IbbJZFVMg) | Ẩn triệt để giỏ rỗng, giá nowrap/tabular-nums không rớt "đ", voucher TECHVIP500 đổi thành "Đang sử dụng", stepper 3 bước, freeship badge xanh, mua kèm AppleCare+. |
| **Đợt 2** | **D2-02 (MH-04M)** | Giỏ hàng — Thẻ ngang di động không tràn lề | `/cart` | Mobile (390px) | `51e70bfe03f24069a2fa09959db18399` | `Refactored (SSoT)` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1X4nK941H29Hlm46yCGcWOXiNMtaEdOC787-q3Qpbh1mW7J99zjTr-OTQaIpK_mbzQk_jUCjiZUMNw2mzKnnzfzmR7ZA_GsdECK_3FT91-AWyuijWOYcUWogkml3YHmqOvXPBh3h6duNPh44cYwb8RY5skzgAaxIXfQ5LCNjpUmoDiqnAHA2ZJ0v1FTKZj6pwjDAfHCZIVlxlRWD-KvtWoSoXrKhrl6JXNE_LvssmsydOjPoF6siE8ibgM) | pb-120px không che sticky summary, tách icon Xóa tất cả kèm confirm modal, hiển thị đơn giá chi tiết 450.000đ x 2, freeship 1 dòng gọn. |
| **Đợt 2** | **D2-03 (MH-05D)** | Thanh toán — Checkout Stepper & Dual Mode | `/checkout` | Desktop (1440px) | `041e18c0b28047d09bf264987db2f665` | `Refactored (SSoT)` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1U4YR79gIgnswinPNUFrDmkJge5LkgWfbeuY0TD219_E8VBaMJ09hffkMD1B608inhDTLThYNV5fPmUfOmpfWdx2wp1n4v-fImu_t4egIg0jEGYJcoFuX2uCDloFqUZhRvG1z8sc8sPmRmbje_se_V3ez6LkyiQXZmWUFaBkrImU0GMim7sXFux0DihPEcJSHbc51PCN5fnOaf2SW1GOJm2Kyz_yIANa5MKnBwp3t-zssxegjo9EbyBPQ) | Thành viên chỉ hiển thị Radio Card địa chỉ đã lưu + thêm mới (ẩn form & vãng lai), tab Giao tận nơi vs Nhận Showroom 2H (45 Showroom), xuất hóa đơn VAT, MoMo/ZaloPay, cảnh báo cọc 10% COD > 20M, dynamic CTA VNPAY. |
| **Đợt 2** | **D2-04 (MH-05M)** | Thanh toán — Single Column & Collapsible Summary | `/checkout` | Mobile (390px) | `1cf207f46bae45f1ac03ddb9a8753079` | `Refactored (SSoT)` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1WWddG2rNWoyqToIdJ_-eT5TE_hmpGhPjyUZMQYHGustE0BeYFHDIA5qZt058N0MSX_0OWX84On1jEj0pOozTxKXiu4g4bvaWldN2HoSp67AUuWvW4oHTPPnasngsNWCP3fb0STKVBFsFSWgh_cx0tLb0tvhtOlHZJoxW1PVXTMelvXPNlHUqaQ74tuFwgCVyrHzc2yhUHrAGUPXCMrig1M3YzD1iVQw_cJG-BIbap6ez_PHflkhMDRVA) | Sửa rớt ký hiệu "đ" ở tổng tiền, bỏ thanh 66% trùng lặp, chia form thành Accordion thu gọn theo bước, inputmode=tel & autocomplete. |
| **Đợt 2** | **D2-05 (MH-06D)** | Xác nhận đơn hàng & Kết quả VNPay Dual State | `/checkout/confirmation`, `/orders/confirmation` | Desktop (1440px) | `a8d7f0efc6514cf9833ec01aa5fd753b` | `Refactored (SSoT)` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1UETvr3HoD1XSEg4q51q1CxIWpAQD508oRRECPgHbxhGVvewAgo3GzL-okTsoBHP3xaBJ2-9_CUpxeyfbiusRDSWBMfPOhljxuNB_b7dNCsNnUf_7v2E9UVsYZk45XGZo6JT1sFGsgYah_U6py64SoX-bJJLFFche2G_z0rxNkeWMNs7nSIZDd3__3T1g4mO5uCLdUQq3VtUwFWwCnkmVxOPEFSFYs_1FAmnrDOrujk6JVUHJ5h7xg5DQ) | Xóa debug text (HTTP 200/400), tách 3 trạng thái độc lập (Thành công #ORD-20261019-8892 có PDF VAT, Thất bại có giải thích & countdown 30m & nút Thanh toán lại Crimson, Đang xác nhận IPN), tiến trình 4 bước. |
| **Đợt 3** | **D3-01 (MH-08D)** | Danh sách Yêu thích — Trash2 & Bulk Action | `/wishlist` | Desktop (1440px) | `cc3b27ff276a4fca868f9e6ff60e72e7` | `Refactored (SSoT)` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1V81ItSNUJj_-nFGFQoAlGsePV6VvG3-_ywHluQKbNK-74U2eq0h_Amt10LsU7owFF5JHXF7aXZ3oO30OY-7jr2yREq3itfAKub0C4RngSm_V6eMo5OVqNBleDK7CUvh-W8JPm3Vda3Dm3F_mRtL8d90dKhLfGKiJu3bGNxvEqPilJTcGddpOypD6DuPOjq4srtv3BDTovrU77mt2Ih9aViWRIF-9f800bz_06Qqdkpcj8ZBCkr6pTlHLM) | Menu header 1 dòng, checkbox indeterminate khi chọn 2/4 món, giá iPhone 16 PM 34.990.000đ, chip specs đồng bộ catalog, nút So sánh mục đã chọn, nút Thêm giỏ Electric Blue. |
| **Đợt 3** | **D3-02 (MH-09D)** | Bộ giao diện Xác thực — Split-Screen Privilege | `/login`, `/register`, `/forgot-password` | Desktop (1440px) | `f13197c4b8f04be3aab27943df5c4aff` | `Refactored (SSoT)` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1VzxwpOj_Cf3sNZBso3SFRpIa6-XeQ2pOTE0BFP5J5FO5NiV-U_LOkOVa8UFi76L40MrgxBN0gt6K7mBL49NFlVchghpKsOZXKad46AKHGIkCfE4FSyCL3FaUjmxS9g5yaG7YcmWvvEZxMlIB2Vdrp8NvGPllC-UVHLg6LYBj9D1KnR1onirR358lPvukfjvp4zbdOSKyy311le7ojrbSBgSuTIDKo5muVip3i_CBMgRv8eqmvK8wbITg) | Thẻ VIP Member Card đặc quyền không đè text HẾT HẠN 12/28, bỏ quote bịa, thêm OTP SĐT + Zalo/Google login, placeholder nhạt, tách rõ form Đăng nhập/Đăng ký. |
| **Đợt 3** | **D3-03 (MH-07D)** | Hồ sơ Tài khoản & Sổ địa chỉ | `/account`, `/account/addresses` | Desktop (1440px) | `a858236d49bd4321945eaec5882b45a8` | `Refactored (SSoT)` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1U6GF1XUYjbakM8RIMs-gThgyS4jY3CJiDflH1bz7odfZiCxZqd6WrfsWCcgVyUrAfnJX2lXYVWOoezMEi_7h0fdXSKGjmNScYqNeNZtr3YYA47XMvS22W3XD1nmpeEwo1bBHhMIkuiHZZtLrpO6byB54UBQUz1Mpj4oAlbya5ZL3fQb58kGMUPe_bKdSfJsHa5qMovl8zF39zu_f-Mbs_6r7t9qRRO040aEtTN1HZIyfjt3_LMvvRx7f4) | Camera icon góc dưới phải avatar NA, form cá nhân View-Only có inline edit, thêm mục hóa đơn VAT & 2FA, thanh tiến độ nâng hạng Kim Cương, ẩn nút Xóa địa chỉ mặc định. |
| **Đợt 3** | **D3-04 (MH-07D-ORD)** | Quản lý & Chi tiết đơn hàng | `/account/orders`, `/account/orders/[orderId]` | Desktop (1440px) | `5d265c6c9f824b40824555222640f31e` | `Refactored (SSoT)` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1UeXlkI8hrVNS7T6a4VoohVvP5XlEtwxW0rfudKtxd_q7m-VmZkstqo1gY7lFHHRP7rCTIcPWpE8RbyUidUslB02yJa3fuoSIGt1Nep7Ctm_Dshm5-lvS15-5K1GkTySAbxgrFTG2smsYoSeYr2dJtkHBTOpnheeDHCuLhMhOL1RxcUt-7hLH20eQA2bVkXh8wGrdrE9XTcAyvVy4Lz88trdR2FQvQJHAyghqkbaPftfCBXrOR32wC0gEg) | Phân định rõ Danh sách đơn vs Chi tiết đơn (có nút quay lại), ngày đặt 19/10/2026, ẩn 4 số giữa SĐT shipper (0912***789) + gọi/chat bảo mật, Serial Number/IMEI từng máy + e-warranty, nút Mua lại, Đánh giá, Hóa đơn VAT. |
| **Đợt 3** | **D3-05 (MH-07D-RET)** | Quản lý & Chi tiết đổi trả hàng | `/account/returns`, `/account/returns/[returnId]` | Desktop (1440px) | `776f4a9c76224152922b5b08894f7015` | `Refactored (SSoT)` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1WFViiFHaq32dzBpWYLpsh43XhcZOyuhQxzK6hUxGBVVGkts0C1rv0J-FDqNxe2iy5IQRGtiWGYEFVlbMxmfcCPvDd6c3YeJAdgg8VDpkP6Nn7FZQB0FrpUnTCANckwYti4w7vTvl1J2VK9J7r8hlAhheHZxL-fZfdjh_p7WRwxs7mIk462-Zj9enowC-xXVdAWc1InqMq6vDS7iybWFYmwHjGfw4pwq7ikgclrrIRDi_FxYhc8oH6S9WI) | Chữ Lý do & nhật ký kỹ thuật viên đổi sang text-slate-800 tương phản cao WCAG AA, sửa lỗi cắt chữ địa chỉ lấy hàng, Bước 5 rõ phương thức & hoàn tiền 24-48H, tính năng đổi trả O2O tại 45 Showroom (15 phút), Sidebar chuẩn. |
| **Đợt 3** | **D3-06 (MH-10D)** | Giới thiệu & Showroom công nghệ / Liên hệ | `/about`, `/contact` | Desktop (1440px) | `c11c05f617134d4184d7914f10565779` | `Refactored (SSoT)` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1XzHPv516TVyhTrMcHXCIe1YVCkxtIS8WJEWp0A5g1W8-aOODwPUXWZNih5rP_HBLUHNevzUEYen42oEY_L0cCKbJSX5SKvUmbHzhxK_0YUvg58nsSjTfO_c610l70f5ZWUphJH-_GsEhqh0IfiKSBOfPQxf0wjDX6IkzTAP_gNMSvzsbOOPkQ7j1miRpPjBBMieOLDnV_WoECABsJiFlOxc34B18G6oeXdPGACyXxct2DbJrA3ctS5G9A) | Thống nhất 45 Showroom, hotline 1800 6868 & 1800 6869, module bản đồ tương tác lọc theo Tỉnh/Thành + giờ mở cửa ("Đang mở cửa • Đóng cửa lúc 21:30") + hotline bàn, Header chuẩn, form B2B có đính kèm file & success alert. |

---

## 3. KIỂM ĐỊNH TÍNH NHẤT QUÁN DESIGN SYSTEM & KHẮC PHỤC TRIỆT ĐỂ LỖI CŨ

Báo cáo kiểm định xác nhận thiết kế mới đã giải quyết triệt để 6 lỗi UI/UX cốt lõi được ghi nhận trong `docs/ui-redesign/01-current-state-inventory.md`:

### 3.1. Khắc phục lỗi tương phản bảng giỏ hàng (`/cart`) ở Light Mode
- **Vấn đề cũ:** Tại file `apps/frontend/ecommerce-client/app/(routes)/cart/page.tsx` và `app/globals.css`, các biến màu CSS cũ khiến bảng danh sách sản phẩm bị chìm vào nền tối xám hoặc chữ đen trên nền tối, không phân biệt rõ đường viền giữa các dòng sản phẩm.
- **Giải pháp trên Stitch (`D2-01 / MH-04D`):** Sử dụng nền trang Slate sáng mát (`#F8FAFC`), toàn bộ khung Card bảng giỏ hàng mang nền trắng tinh khiết (`#FFFFFF`), viền thẻ nhẹ nhàng sắc nét (`border slate-200`), văn bản màu Slate đậm (`#0F172A`) với độ tương phản WCAG AAA vượt trội (> 12:1).

### 3.2. Khắc phục lỗi nút bấm "trắng trên nền trắng" ở `/wishlist` Dark Mode
- **Vấn đề cũ:** Nút hành động *"Thêm vào giỏ hàng"* trong component `wishlist-item.tsx` sử dụng class màu không đồng bộ, khi người dùng chuyển sang Dark Mode nút bị mất nền hoặc chữ trắng chìm trên nền trắng, gây ức chế thị giác.
- **Giải pháp trên Stitch (`D3-01 / MH-08D`):** Nút CTA chính của thẻ được gán token màu Semantic chuẩn: nền Electric Blue công nghệ (`#2563EB`) với chữ trắng tương phản cao (`text-white`) hoặc viền Slate có nền rõ ràng ở cả Light Mode và Dark Mode. Tuyệt đối không còn tình trạng chữ trắng trên nền trắng.

### 3.3. Bổ sung Chip thông số kỹ thuật, Badge bảo hành & Nút so sánh trên `ProductCard` / `ProductListItem`
- **Vấn đề cũ:** Các thẻ sản phẩm tại Trang chủ và Trang Danh mục (`/products`) quá đơn điệu, thiếu thông tin kỹ thuật cốt lõi khiến tỷ lệ chuyển đổi thấp, người dùng phải bấm vào từng trang chi tiết mới biết RAM/Bộ nhớ/Chipset.
- **Giải pháp trên Stitch (`D1-01`, `D1-03`, `D1-05`):**
  - Mọi thẻ sản phẩm đều có dải **Key Spec Chips** (Ví dụ: `A18 Pro • 6.9" 120Hz • 256GB`, `M3 Pro 18GB • 512GB SSD`).
  - Đính kèm **Badge Bảo hành chính hãng** (`Bảo hành 24T chính hãng Apple VN / Samsung VN`).
  - Tích hợp nút **"So sánh (+)"** trực tiếp trên từng thẻ, kích hoạt thanh nổi `Floating Compare Bar` cố định đáy màn hình.

### 3.4. Loại bỏ trùng lặp điều hướng giữa `AccountSidebar` và Tabs nội bộ ở `/account`
- **Vấn đề cũ:** Khi vào trang `/account`, người dùng thấy menu cột trái có các mục (Đơn hàng, Địa chỉ, Đổi trả), nhưng ở cột bên phải lại xuất hiện thêm một thanh Tabs lặp lại y hệt các đề mục đó, gây lãng phí diện tích và khó hiểu về mặt UX. Avatar người dùng còn bị lỗi tràn chữ ra ngoài vòng tròn viền.
- **Giải pháp trên Stitch (`D3-03`, `D3-04`, `D3-05`):**
  - Hợp nhất thành **1 Hệ điều hướng Sidebar 300px duy nhất** với trạng thái Active rõ ràng (viền trái Electric Blue dày 4px, nền blue-50).
  - Cột bên phải chỉ tập trung hiển thị nội dung chuyên sâu của từng phân hệ (3 KPI tóm tắt, Sổ địa chỉ, Chi tiết đơn hàng với Stepper vận chuyển 4 bước, Phiếu đổi trả với quy trình kiểm định 5 bước).
  - Avatar người dùng được chuẩn hóa kích thước 64x64px, chữ viết tắt "NA" căn giữa hoàn hảo, không còn tình trạng tràn lề.

### 3.5. Đổi icon xóa trong `/wishlist` từ hình Trái tim sang hình Thùng rác (`Trash2`)
- **Vấn đề cũ:** Tại trang danh sách yêu thích, nút xóa sản phẩm khỏi danh sách vẫn giữ nguyên icon hình Trái tim, khiến người dùng lầm tưởng đây là nút "bỏ thích" nhưng không chắc chắn sản phẩm có bị xóa hẳn hay không.
- **Giải pháp trên Stitch (`D3-01 / MH-08D`):**
  - Chuyển đổi dứt khoát sang **icon Thùng rác (`Trash2`)** màu `slate-400`, hover chuyển sang `text-rose-600` và nền `bg-rose-50`, kèm tooltip *"Xóa khỏi danh sách yêu thích"*.
  - Bổ sung **Khung thao tác hàng loạt (Bulk Action Bar)** cho phép chọn nhiều sản phẩm cùng lúc để *"Thêm vào giỏ hàng"* hoặc *"Xóa các mục đã chọn"*.

### 3.6. Thống nhất mốc Freeship `500.000₫` toàn bộ hệ thống
- **Vấn đề cũ:** Một số trang ghi mốc freeship 300k, một số trang ghi 1 triệu, gây mâu thuẫn chính sách bán hàng.
- **Giải pháp trên Stitch (`D1-01`, `D2-01`, `D2-02`, `D2-03`):**
  - Thống nhất duy nhất một mốc chuẩn trên toàn bộ hệ thống: **`500.000₫`**.
  - Hiển thị nhất quán trên Announcement Bar: *"Miễn phí vận chuyển toàn quốc cho đơn từ 500.000đ | Cam kết 100% chính hãng • Bảo hành ủy quyền 24 tháng | Hotline: 1900 6868"*.
  - Tích hợp **Thanh tiến trình Freeship (Free Shipping Progress Bar)** trực quan ngay trong trang Giỏ hàng và Thanh toán.

---

## 4. CHECKLIST NGHIỆM THU DÀNH CHO CHỦ DỰ ÁN (APPROVAL CHECKLIST)

Chủ dự án có thể sử dụng checklist dưới đây để rà soát và đánh dấu phê duyệt hoặc ghi chú điều chỉnh trước khi cho phép bước vào Giai đoạn 5 (Code Frontend):

### [ ] ĐỢT 1: LUỒNG KHÁM PHÁ & SẢN PHẨM (7 MÀN HÌNH)
- [ ] **MH-01D (Trang chủ Desktop):** Bố cục Bento Grid cân đối, Banner S26 Ultra sang trọng, lưới sản phẩm có spec chips và VIP banner hợp lý.
- [ ] **MH-01M (Trang chủ Mobile):** Lưới 2 cột di động rõ ràng, trust badges 2x2 gọn gàng, bottom nav bar tiện thao tác ngón cái.
- [ ] **MH-02D (Danh mục Desktop):** Cột lọc 280px đầy đủ khoảng giá/thương hiệu, ProductListItem dạng hàng ngang nổi bật, thanh Floating Compare Bar xuất hiện mượt mà.
- [ ] **MH-02M (Danh mục Mobile):** Bộ lọc dạng Drawer Bottom Sheet thân thiện ngón tay, nút áp dụng nổi bật.
- [ ] **MH-03D (Chi tiết sản phẩm Desktop):** Bố cục PDP công nghệ đẳng cấp, bộ chọn màu/bộ nhớ sắc nét, bảng thông số kỹ thuật 14 mục chi tiết.
- [ ] **MH-03M (Chi tiết sản phẩm Mobile):** Sticky Buy Bar cố định đáy màn hình (giá + nút Thêm giỏ + Mua ngay).
- [ ] **MH-03C (Ma trận so sánh Desktop):** Bảng so sánh 4 cột rõ ràng, công tắc lọc khác biệt và highlight thông số vượt trội.

### [ ] ĐỢT 2: LUỒNG GIỎ HÀNG & THANH TOÁN (5 MÀN HÌNH)
- [ ] **MH-04D (Giỏ hàng Desktop):** Bảng sản phẩm nền trắng `#FFFFFF` sạch sẽ, tiến trình Freeship `500.000₫`, voucher `TECHVIP500`.
- [ ] **MH-04M (Giỏ hàng Mobile):** Thẻ sản phẩm dạng hàng dọc gọn gàng không bị tràn ngang, thanh thanh toán cố định đáy màn hình.
- [ ] **MH-05D (Thanh toán Desktop):** Checkout Stepper Bước 2, công tắc Khách vãng lai / Thành viên, 3 dropdown địa giới hành chính, chọn VNPay/COD trực quan.
- [ ] **MH-05M (Thanh toán Mobile):** Form 1 cột chuẩn touch target, tóm tắt đơn dạng accordion mở rộng/thu gọn.
- [ ] **MH-06D (Xác nhận VNPay Desktop):** Trình bày song song Case Thành công (check xanh, mã #ORD, VNP14298834) và Case Thất bại (Mã 24, Thử lại VNPay/COD).

### [ ] ĐỢT 3: LUỒNG TÀI KHOẢN, XÁC THỰC & PHỤ TRỢ (6 MÀN HÌNH)
- [ ] **MH-08D (Yêu thích Desktop):** Icon thùng rác `Trash2` thay thế icon tim, thanh Bulk Action Bar chọn tất cả, nút thêm giỏ màu Electric Blue tương phản chuẩn.
- [ ] **MH-09D (Xác thực Desktop):** Split-screen 50/50, nửa trái Thẻ Black Diamond VIP 3D với 4 đặc quyền thành viên, nửa phải form tabs có Google OAuth và mã hóa SSL.
- [ ] **MH-07D (Hồ sơ & Địa chỉ Desktop):** Sidebar 300px avatar "NA" không tràn chữ, 3 thẻ KPI thống kê, form thông tin có badge xác thực OTP, sổ địa chỉ (Nhà riêng & Công ty).
- [ ] **MH-07D-ORD (Quản lý đơn hàng Desktop):** Tab lọc trạng thái đơn, chi tiết đơn `#ORD-8892` với Stepper 4 bước GHN Express, bảng thanh toán rõ ràng.
- [ ] **MH-07D-RET (Quản lý đổi trả Desktop):** Phiếu đổi trả `#RET-104` (Đã duyệt), Stepper 5 bước, thông tin Anker Prime 100W GaN, GHN thu hồi miễn phí.
- [ ] **MH-10D (Giới thiệu & Showroom Desktop):** Dark Tech Hero, 4 KPI uy tín, Showroom Hà Nội (48 Tố Hữu) & TP.HCM (157 Khánh Hội), Hotline `0975 431 485`, Form hỗ trợ B2B/Bảo hành phản hồi 2h.

### [ ] HỆ THỐNG MÀU SEMANTIC & TYPOGRAPHY
- [ ] Đã loại bỏ hoàn toàn các màu hồng ám lệch tông (`#906f70`, `#ffebee`).
- [ ] Nút CTA mua ngay / thanh toán thống nhất dùng Tech Crimson (`#E11D48`).
- [ ] Màu nhận diện công nghệ & liên kết tương tác thống nhất dùng Electric Blue (`#2563EB`).
- [ ] Số tiền và thông số kỹ thuật áp dụng font chuẩn `tabular-nums` thẳng hàng.

---

## 5. 🛑 ĐIỂM DỪNG BẮT BUỘC (MANDATORY STOP GATE)

> [!IMPORTANT]
> **THÔNG BÁO TẠM DỪNG THỰC THI (STOP GATE ACTIVATED):**
> - Theo đúng quy tắc an toàn kiến trúc, **tôi đã dừng lại hoàn toàn mọi hoạt động tạo mới hoặc chỉnh sửa code**.
> - Tuyệt đối **KHÔNG** chỉnh sửa bất kỳ file nào trong `apps/frontend/ecommerce-client` (kể cả `globals.css` hay component).
> - Tuyệt đối **KHÔNG** chuyển sang Giai đoạn 5 (Code Frontend) cho đến khi nhận được phản hồi xác nhận phê duyệt chính thức từ Chủ dự án.
> - Kính mời Chủ dự án xem xét các liên kết ảnh giao diện trong bảng trên và gửi phản hồi để tiến hành các bước tiếp theo!
