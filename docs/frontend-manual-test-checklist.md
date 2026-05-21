# Frontend Manual Test Checklist

Ngay tao: 2026-05-21

Pham vi:

- `apps/frontend/ecommerce-client`
- `apps/frontend/ecommerce-dashboard`

Huong dan: dien cot "Ghi chu loi neu co" khi ket qua thuc te khac ket qua mong doi. Neu can, bo sung URL, account test, screenshot, console error, network request va thoi diem test.

## ecommerce-client

| Luong | Muc tieu | Buoc test | Ket qua mong doi | Ghi chu loi neu co |
| --- | --- | --- | --- | --- |
| Home page | Xac nhan trang chu render dung va cac section chinh hien thi | Mo `/`; refresh trang; kiem tra hero/banner, category, product sections, header/footer | Trang load khong loi console nghiem trong; anh hien dung; link dieu huong chinh click duoc |  |
| Product listing | Xac nhan danh sach san pham, filter, sort va pagination/scroll hoat dong | Mo `/products`; doi filter category/brand/price; doi sort; chuyen trang neu co | URL/state cap nhat hop ly; danh sach san pham dung filter; loading/error state ro rang |  |
| Product detail | Xac nhan trang chi tiet san pham day du thong tin va CTA | Mo mot san pham; doi anh/gallery, variant mau/size neu co; click add to cart | Ten/gia/anh/mo ta/review hien dung; add to cart thanh cong hoac bao loi hop le |  |
| Search | Xac nhan tim kiem san pham va suggestion neu co | Nhap tu khoa o search box; submit; thu tu khoa co/khong co ket qua | Ket qua phu hop tu khoa; empty state ro rang; khong reload vo han |  |
| Cart guest | Xac nhan guest cart khong can dang nhap | Trong private/incognito, add product vao cart; mo `/cart`; sua so luong; xoa item; refresh | Cart giu item qua refresh bang guest id; tong tien dung; xoa/sua cap nhat dung |  |
| Cart logged-in user | Xac nhan cart cua user dang nhap va merge guest cart neu co | Tao guest cart; dang nhap; mo cart; sua so luong/xoa item | Cart user hien dung; neu co merge thi item guest duoc giu theo nghiep vu; khong mat cart bat ngo |  |
| Login/register/logout | Xac nhan auth flow va redirect an toan | Mo `/login`; login sai/dung; dang xuat; tao tai khoan test neu moi truong cho phep | Login dung redirect ve returnUrl hoac `/`; login sai hien loi; logout xoa session va quay ve login |  |
| Wishlist | Xac nhan wishlist yeu cau dang nhap hoac xu ly guest ro rang | Khi guest click wishlist; khi logged-in them/xoa wishlist; mo trang wishlist neu co | Guest duoc yeu cau login hoac hien thong bao hop le; logged-in them/xoa thanh cong |  |
| Checkout | Xac nhan guest checkout va logged-in checkout | Tu cart guest mo `/checkout`; dat COD; lap lai voi user dang nhap; thu nut dang nhap trong checkout | Guest checkout khong bi redirect bat buoc; logged-in duoc prefill thong tin neu co; order tao thanh cong |  |
| Account profile | Xac nhan account route bat buoc login va profile load dung | Guest mo `/account`; login bang returnUrl; cap nhat profile neu moi truong cho phep | Guest redirect `/login?returnUrl=/account`; login xong quay lai; profile hien/cap nhat dung |  |
| Orders | Xac nhan lich su va chi tiet don hang | Dang nhap; mo `/account/orders`; mo chi tiet mot order; kiem tra status/items/tong tien | Danh sach va chi tiet don dung user; loading/error state ro rang; guest bi redirect login |  |

## ecommerce-dashboard

| Luong | Muc tieu | Buoc test | Ket qua mong doi | Ghi chu loi neu co |
| --- | --- | --- | --- | --- |
| Login/logout | Xac nhan dashboard auth guard va returnUrl | Guest mo `/dashboard`, `/products`, `/orders`; login admin/manager; logout | Guest redirect `/login?returnUrl=...`; login thanh cong vao dashboard/returnUrl; logout xoa session |  |
| Dashboard overview | Xac nhan overview render so lieu va chart | Dang nhap; mo `/dashboard`; refresh; kiem tra card/chart/table overview | Khong loi console nghiem trong; so lieu load hoac empty state hop ly; responsive on desktop |  |
| Product management | Xac nhan CRUD san pham va variant/image form | Mo `/products`; search/filter; tao/sua/xem chi tiet san pham neu moi truong cho phep | List load dung; form validate dung; tao/sua thanh cong hoac bao loi API ro rang |  |
| Order management | Xac nhan quan ly don hang | Mo `/orders`; loc status/date neu co; mo chi tiet; cap nhat trang thai neu moi truong cho phep | Don hang load dung; status update thanh cong; UI khong cap nhat sai khi API fail |  |
| Customer management | Xac nhan user/customer pages va account lock | Mo `/users`; xem chi tiet user; cap nhat/khoa/mo khoa neu moi truong cho phep | Du lieu user dung; action co confirm/toast; permission/API errors hien ro |  |
| Upload/image display | Xac nhan upload preview va anh remote/local hien dung | Thu upload banner/category/brand/product/avatar; xem preview; reload trang detail/list | Preview hien dung; upload path render qua `/uploads` hoac remotePatterns hop le; anh loi co fallback |  |
| Notification/SignalR | Xac nhan thong bao realtime neu moi truong co SignalR | Dang nhap dashboard; mo notifications; trigger event tu backend/hanh dong tao notification neu co | Ket noi SignalR khong loop; notification moi hien dung; disconnect/reconnect khong spam loi |  |
