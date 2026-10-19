using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Persistence.Seed
{
    public partial class ApplicationDbContextSeed
    {
        private async Task SeedFeaturedCategoriesDataAsync()
        {
            _logger.LogInformation("Seeding featured categories products (Laptop, Audio, SmartHome, Accessories, Wearables)...");

            var categories = await _context.Categories.ToListAsync();
            var brands = await _context.Brands.ToListAsync();
            var users = await _context.Users.ToListAsync();

            var catLaptop = categories.FirstOrDefault(c => c.Code == "Laptop") ?? categories.FirstOrDefault(c => c.Slug == "laptop");
            var catAudio = categories.FirstOrDefault(c => c.Code == "MS") ?? categories.FirstOrDefault(c => c.Slug == "am-thanh");
            var catSmartHome = categories.FirstOrDefault(c => c.Code == "SMARTHOME") ?? categories.FirstOrDefault(c => c.Slug == "nha-thong-minh");
            var catAccessories = categories.FirstOrDefault(c => c.Code == "PKCN") ?? categories.FirstOrDefault(c => c.Slug == "phu-kien-cong-nghe");
            var catWearables = categories.FirstOrDefault(c => c.Code == "WEARABLE") ?? categories.FirstOrDefault(c => c.Slug == "thiet-bi-deo-thong-minh");

            var brandApple = brands.FirstOrDefault(b => b.Code == "Apple") ?? brands.First();
            var brandSony = brands.FirstOrDefault(b => b.Code == "Sony") ?? brandApple;
            var brandMarshall = brands.FirstOrDefault(b => b.Code == "Marshall") ?? brandApple;
            var brandJBL = brands.FirstOrDefault(b => b.Code == "JBL") ?? brandApple;
            var brandBose = brands.FirstOrDefault(b => b.Code == "Bose") ?? brandApple;
            var brandGarmin = brands.FirstOrDefault(b => b.Code == "Garmin") ?? brandApple;
            var brandAsus = brands.FirstOrDefault(b => b.Code == "ASUS") ?? brandApple;
            var brandDell = brands.FirstOrDefault(b => b.Code == "Dell") ?? brandApple;
            var brandLenovo = brands.FirstOrDefault(b => b.Code == "Lenovo") ?? brandApple;
            var brandAqara = brands.FirstOrDefault(b => b.Code == "Aqara") ?? brandApple;
            var brandPhilipsHue = brands.FirstOrDefault(b => b.Code == "PhilipsHue") ?? brandApple;
            var brandAnker = brands.FirstOrDefault(b => b.Code == "Anker") ?? brandApple;
            var brandBelkin = brands.FirstOrDefault(b => b.Code == "Belkin") ?? brandApple;
            var brandUgreen = brands.FirstOrDefault(b => b.Code == "Ugreen") ?? brandApple;
            var brandLogitech = brands.FirstOrDefault(b => b.Code == "Logitech") ?? brandApple;
            var brandSamsung = brands.FirstOrDefault(b => b.Code == "Samsung") ?? brandApple;
            var brandXiaomi = brands.FirstOrDefault(b => b.Code == "Xiaomi") ?? brandApple;
            var brandOther = brands.FirstOrDefault(b => b.Code == "Other") ?? brandApple;

            var newProducts = new List<Product>();

            void AddProductIfMissing(
                string code,
                string name,
                string slug,
                string sku,
                decimal price,
                decimal? salePrice,
                string image,
                string description,
                int stockQuantity,
                Guid? categoryId,
                Guid brandId,
                double rating,
                int reviewCount)
            {
                if (categoryId == null) return;
                if (_context.Products.Any(p => p.Slug == slug)) return;

                var p = Product.Create(
                    code,
                    name,
                    slug,
                    sku,
                    price,
                    salePrice,
                    image,
                    description,
                    stockQuantity,
                    categoryId.Value,
                    brandId
                );
                p.UpdateRating(rating, reviewCount);
                newProducts.Add(p);
            }

            // ==========================================
            // 1. LAPTOP & TABLET (6 sản phẩm)
            // ==========================================
            AddProductIfMissing(
                "MBP-16-M3MAX-36-1TB",
                "MacBook Pro 16 inch M3 Max 36GB 1TB",
                "macbook-pro-16-inch-m3-max-36gb-1tb",
                "APPLE-MBP16-M3MAX-BLK",
                89990000, 84990000,
                "products/macbook-pro-16-inch-m3-max-main.jpg",
                "MacBook Pro 16 inch với chip Apple M3 Max 14 CPU, 30 GPU. Màn hình Liquid Retina XDR 120Hz ProMotion đỉnh cao, thời lượng pin lên đến 22 giờ vượt trội.",
                25, catLaptop?.Id, brandApple.Id, 5.0, 14
            );

            AddProductIfMissing(
                "MBA-13-M3-16-512",
                "MacBook Air 13 inch M3 16GB 512GB",
                "macbook-air-13-inch-m3-16gb-512gb",
                "APPLE-MBA13-M3-MID",
                32990000, 29990000,
                "products/macbook-air-13-inch-m3-main.jpg",
                "MacBook Air 13 inch siêu mỏng nhẹ 11.3mm trang bị chip M3 tiến trình 3nm, hỗ trợ xuất đồng thời 2 màn hình ngoài khi gập máy, pin 18 giờ.",
                40, catLaptop?.Id, brandApple.Id, 4.9, 28
            );

            AddProductIfMissing(
                "IPAD-PRO-13-M4-256",
                "iPad Pro 13 inch M4 Ultra Retina Tandem OLED 256GB WiFi",
                "ipad-pro-13-inch-m4-ultra-retina-oled-256gb",
                "APPLE-IPADPRO13-M4-SLV",
                37990000, 35490000,
                "products/ipad-pro-13-inch-m4-main.jpg",
                "iPad Pro M4 với thiết kế siêu mỏng 5.1mm, màn hình Ultra Retina XDR Tandem OLED đột phá độ sáng đỉnh 1600 nits, chip Apple M4 sức mạnh đồ họa thế hệ mới.",
                30, catLaptop?.Id, brandApple.Id, 5.0, 19
            );

            AddProductIfMissing(
                "ROG-ZEPHYRUS-G16",
                "ASUS ROG Zephyrus G16 OLED Intel Core Ultra 9 185H RTX 4080",
                "asus-rog-zephyrus-g16-oled-gu605",
                "ASUS-G16-U9-4080-GRY",
                68990000, 64990000,
                "products/asus-rog-zephyrus-g16-main.jpg",
                "Laptop gaming cao cấp vỏ nhôm CNC nguyên khối tích hợp dải đèn Slash Lighting. Màn hình 16 inch 2.5K ROG Nebula OLED 240Hz 0.2ms, tản nhiệt buồng hơi êm ái.",
                15, catLaptop?.Id, brandAsus.Id, 4.8, 11
            );

            AddProductIfMissing(
                "DELL-XPS-16-9640",
                "Dell XPS 16 9640 Intel Core Ultra 7 32GB 1TB RTX 4060 4K OLED",
                "dell-xps-16-9640-core-ultra-7-4k-oled",
                "DELL-XPS16-9640-SLV",
                69990000, 65990000,
                "products/dell-xps-16-9640-main.jpg",
                "Tuyệt tác thiết kế tương lai với khung nhôm gia công CNC, bàn rê chuột bằng kính tàng hình haptic, hàng phím chức năng cảm ứng và màn hình 4K+ OLED tràn viền.",
                12, catLaptop?.Id, brandDell.Id, 4.7, 8
            );

            AddProductIfMissing(
                "THINKPAD-X1-C-G12",
                "Lenovo ThinkPad X1 Carbon Gen 12 Core Ultra 7 32GB 1TB 2.8K OLED",
                "lenovo-thinkpad-x1-carbon-gen-12",
                "LENOVO-X1C-G12-BLK",
                54990000, 49990000,
                "products/lenovo-thinkpad-x1-carbon-gen-12-main.jpg",
                "Laptop doanh nhân huyền thoại vỏ sợi carbon siêu nhẹ 1.09kg đạt chuẩn quân đội MIL-STD 810H, màn hình 2.8K OLED 120Hz và bàn phím công thái học đỉnh cao.",
                20, catLaptop?.Id, brandLenovo.Id, 4.9, 15
            );

            // ==========================================
            // 2. ÂM THANH ĐỈNH CAO (6 sản phẩm)
            // ==========================================
            AddProductIfMissing(
                "SONY-WH1000XM5",
                "Tai nghe chụp tai chống ồn không dây Sony WH-1000XM5 Hi-Res Audio",
                "tai-nghe-sony-wh-1000xm5",
                "SONY-WH1000XM5-SLV",
                8490000, 6990000,
                "products/tai-nghe-sony-wh-1000xm5-main.jpg",
                "Công nghệ chống ồn hàng đầu thế giới với bộ xử lý tích hợp V1 và HD QN1, 8 micro khử ồn, củ loa 30mm sợi carbon mang lại âm thanh Hi-Res LDAC nguyên bản.",
                50, catAudio?.Id, brandSony.Id, 4.9, 45
            );

            AddProductIfMissing(
                "MARSHALL-STANMORE-3",
                "Loa Bluetooth Marshall Stanmore III Vintage Iconic Sound",
                "loa-marshall-stanmore-iii",
                "MARSHALL-STAN3-BRN",
                10990000, 9690000,
                "products/loa-marshall-stanmore-iii-main.jpg",
                "Thiết kế vintage huyền thoại với chất liệu phủ vân da, lưới dệt cổ điển và núm xoay kim loại đồng thau. Âm trường mở rộng sống động với công suất 80W tràn ngập gian phòng.",
                35, catAudio?.Id, brandMarshall.Id, 5.0, 32
            );

            AddProductIfMissing(
                "AIRPODS-PRO-2-USBC",
                "Tai nghe không dây Apple AirPods Pro 2 MagSafe USB-C (H2 Chip)",
                "apple-airpods-pro-2-usb-c",
                "APPLE-APP2-USBC-WHT",
                6190000, 5390000,
                "products/apple-airpods-pro-2-usb-c-main.jpg",
                "Chip Apple H2 khử tiếng ồn gấp 2 lần, Chế độ Âm Thanh Thích Ứng Adaptive Audio, Cảm ứng lực điều chỉnh âm lượng trên thân tai nghe, chuẩn kháng nước bụi IP54.",
                100, catAudio?.Id, brandApple.Id, 4.9, 88
            );

            AddProductIfMissing(
                "BOSE-QC-ULTRA-HP",
                "Tai nghe chống ồn Bose QuietComfort Ultra Immersive Audio",
                "tai-nghe-bose-quietcomfort-ultra",
                "BOSE-QCU-BLK",
                10990000, 9490000,
                "products/tai-nghe-bose-quietcomfort-ultra-main.jpg",
                "Công nghệ âm thanh Bose Immersive Audio vượt trội, khả năng cá nhân hóa âm thanh CustomTune độc quyền theo hình dáng tai, êm ái tối đa suốt 24 giờ sử dụng liên tục.",
                25, catAudio?.Id, brandBose.Id, 4.8, 18
            );

            AddProductIfMissing(
                "JBL-BOOMBOX-3-WIFI",
                "Loa di động công suất khủng JBL Boombox 3 Wi-Fi Dolby Atmos 3D",
                "loa-jbl-boombox-3-wifi",
                "JBL-BB3-WIFI-BLK",
                14900000, 12890000,
                "products/loa-jbl-boombox-3-wifi-main.jpg",
                "Công suất cực đại 180W với âm bass sâu uy lực, hỗ trợ phát nhạc qua Wi-Fi chuẩn Dolby Atmos độ nét cao không gián đoạn, chống nước chống bụi chuẩn IP67, pin 24 giờ.",
                20, catAudio?.Id, brandJBL.Id, 4.9, 21
            );

            AddProductIfMissing(
                "AIRPODS-MAX-USBC",
                "Tai nghe Over-Ear Apple AirPods Max USB-C Lossless Audio",
                "apple-airpods-max-usb-c",
                "APPLE-APM-USBC-MID",
                13990000, 12990000,
                "products/apple-airpods-max-usb-c-main.jpg",
                "Tai nghe chụp tai cao cấp nhất của Apple với khung thép không gỉ bọc lớp hoàn thiện mịn màng, vòm lưới đan thoáng khí knit-mesh, driver 40mm độ méo tiếng siêu thấp.",
                15, catAudio?.Id, brandApple.Id, 4.8, 16
            );

            // ==========================================
            // 3. NHÀ THÔNG MINH (6 sản phẩm)
            // ==========================================
            AddProductIfMissing(
                "AQARA-HUB-M3",
                "Bộ điều khiển trung tâm nhà thông minh Aqara Hub M3 chuẩn Matter & Thread",
                "hub-matter-aqara-m3",
                "AQARA-M3-HUB-BLK",
                3290000, 2790000,
                "products/hub-matter-aqara-m3-main.jpg",
                "Trung tâm kết nối Matter Controller & Thread Border Router, hỗ trợ Zigbee 3.0, Wi-Fi băng tần kép, Bluetooth và mắt hồng ngoại 360 độ điều khiển điều hòa, TV dễ dàng.",
                60, catSmartHome?.Id, brandAqara.Id, 4.9, 30
            );

            AddProductIfMissing(
                "AQARA-LOCK-U200",
                "Khóa cửa thông minh Aqara U200 Smart Lock Kit Apple Home Key Matter",
                "khoa-cua-thong-minh-aqara-u200",
                "AQARA-U200-KIT-SLV",
                7490000, 6490000,
                "products/khoa-cua-thong-minh-aqara-u200-main.jpg",
                "Khóa thông minh lắp đặt retrofit không cần khoan đục cửa, mở khóa một chạm Apple Home Key qua iPhone/Apple Watch, cảm biến vân tay sinh trắc học siêu tốc 0.3s.",
                30, catSmartHome?.Id, brandAqara.Id, 5.0, 24
            );

            AddProductIfMissing(
                "HUE-STARTER-E27",
                "Bộ kit đèn thông minh Philips Hue White & Color Ambiance E27 (3 bóng + 1 Hub)",
                "den-philips-hue-starter-kit-e27",
                "PHILIPS-HUE-E27-KIT",
                4490000, 3990000,
                "products/den-philips-hue-starter-kit-e27-main.jpg",
                "16 triệu màu sắc sinh động và dải ánh sáng trắng ấm đến mát, đồng bộ hóa ánh sáng theo nhạc Spotify và phim ảnh, điều khiển mượt mà qua Apple HomeKit và Google Assistant.",
                40, catSmartHome?.Id, brandPhilipsHue.Id, 4.9, 37
            );

            AddProductIfMissing(
                "GOOGLE-NEST-HUB-G2",
                "Màn hình thông minh Google Nest Hub Gen 2 theo dõi giấc ngủ Soli Radar",
                "google-nest-hub-gen-2",
                "GG-NESTHUB-G2-CHA",
                2490000, 1890000,
                "products/google-nest-hub-gen-2-main.jpg",
                "Màn hình cảm ứng 7 inch thông minh điều khiển toàn bộ thiết bị Google Home, tích hợp công nghệ Soli Radar theo dõi chu kỳ giấc ngủ không cần đeo vòng, loa âm trầm mạnh hơn 50%.",
                50, catSmartHome?.Id, brandOther.Id, 4.7, 42
            );

            AddProductIfMissing(
                "APPLE-HOMEPOD-MINI",
                "Loa thông minh Apple HomePod mini Âm thanh vòm 360 độ Hỗ trợ Thread",
                "apple-homepod-mini",
                "APPLE-HPMINI-WHT",
                2990000, 2590000,
                "products/apple-homepod-mini-main.jpg",
                "Loa thông minh hình cầu nhỏ gọn bọc vải dệt âm học nguyên khối, âm thanh 360 độ sống động, tích hợp cảm biến nhiệt độ - độ ẩm phòng và vai trò Thread Border Router.",
                45, catSmartHome?.Id, brandApple.Id, 4.8, 35
            );

            AddProductIfMissing(
                "AQARA-CAMERA-G3",
                "Camera an ninh thông minh xoay 360 Aqara Camera Hub G3 AI 2K Apple HomeKit Secure Video",
                "camera-aqara-hub-g3-ai-2k",
                "AQARA-G3-CAM-WHT",
                2790000, 2290000,
                "products/camera-aqara-hub-g3-ai-2k-main.jpg",
                "Độ phân giải 2K 1296p sắc nét, NPU AI nhận diện khuôn mặt, thú cưng và cử chỉ ra lệnh, hỗ trợ Apple HomeKit Secure Video mã hóa đầu cuối và chế độ che ống kính vật lý riêng tư.",
                35, catSmartHome?.Id, brandAqara.Id, 4.9, 29
            );

            // ==========================================
            // 4. PHỤ KIỆN CAO CẤP (6 sản phẩm)
            // ==========================================
            AddProductIfMissing(
                "ANKER-PRIME-100W",
                "Củ sạc nhanh Anker Prime 100W GaN 3 cổng (2 USB-C + 1 USB-A) Siêu Nhỏ Gọn",
                "cu-sac-anker-prime-100w-gan",
                "ANKER-A2668-BLK",
                1890000, 1590000,
                "products/cu-sac-anker-prime-100w-gan-main.jpg",
                "Công nghệ GaNPrime thế hệ mới nhỏ gọn hơn 43%, công suất 100W sạc nhanh cùng lúc laptop, tablet và điện thoại, kiểm soát nhiệt độ tự động ActiveShield 2.0 an toàn tuyệt đối.",
                80, catAccessories?.Id, brandAnker.Id, 4.9, 65
            );

            AddProductIfMissing(
                "BELKIN-3IN1-15W",
                "Trạm sạc không dây Belkin BoostCharge Pro 3-in-1 MagSafe 15W Chuẩn Qi2",
                "tram-sac-belkin-boostcharge-pro-3-in-1",
                "BELKIN-WIZ016-WHT",
                3990000, 3390000,
                "products/tram-sac-belkin-boostcharge-pro-3-in-1-main.jpg",
                "Chuẩn sạc chính hãng Made for MagSafe sạc nhanh không dây 15W cho iPhone, đế sạc chuyên dụng Apple Watch sạc 80% trong 45 phút, chân đế kim loại mạ chrome sang trọng.",
                35, catAccessories?.Id, brandBelkin.Id, 5.0, 27
            );

            AddProductIfMissing(
                "UGREEN-CABLE-240W",
                "Cáp sạc nhanh Ugreen 240W USB-C to USB-C bọc dù hợp kim kẽm E-Marker Chip",
                "cap-ugreen-240w-type-c-to-c",
                "UGREEN-240W-2M",
                350000, 289000,
                "products/cap-ugreen-240w-type-c-to-c-main.jpg",
                "Chuẩn sạc PD 3.1 công suất tối đa 240W (48V/5A), tích hợp chip thông minh E-Marker điều phối dòng sạc, vỏ bọc sợi dù nylon bện chịu tải hơn 20,000 lần gập bẻ, dài 2m tiện dụng.",
                150, catAccessories?.Id, brandUgreen.Id, 4.9, 120
            );

            AddProductIfMissing(
                "LOGI-MX-MASTER-3S",
                "Chuột công thái học cao cấp Logitech MX Master 3S Quiet Clicks 8K DPI",
                "chuot-logitech-mx-master-3s",
                "LOGI-MXM3S-GRA",
                2590000, 2249000,
                "products/chuot-logitech-mx-master-3s-main.jpg",
                "Cảm biến Darkfield 8000 DPI theo dõi trên mọi bề mặt kể cả mặt kính dày, con lăn điện từ MagSpeed cuộn 1000 dòng/giây, công tắc Quiet Clicks giảm 90% tiếng ồn bấm chuột.",
                70, catAccessories?.Id, brandLogitech.Id, 5.0, 95
            );

            AddProductIfMissing(
                "KEYCHRON-Q1-PRO",
                "Bàn phím cơ không dây Full nhôm CNC Keychron Q1 Pro QMK/VIA Gasket Mount",
                "ban-phim-keychron-q1-pro",
                "KEYCHRON-Q1P-RED",
                4890000, 4390000,
                "products/ban-phim-keychron-q1-pro-main.jpg",
                "Khung nhôm nguyên khối 6063 CNC anode hóa cao cấp, cấu trúc Double Gasket Mount triệt tiêu tiếng vang cho âm gõ đầm ấm, kết nối Bluetooth 5.1 đa thiết bị và tùy biến QMK/VIA.",
                25, catAccessories?.Id, brandOther.Id, 4.9, 34
            );

            AddProductIfMissing(
                "SHARGEEK-STORM-2",
                "Pin sạc dự phòng Shargeek Storm 2 vỏ trong suốt Cyberpunk 100W 25600mAh",
                "pin-du-phong-shargeek-storm-2-100w",
                "SHARGEEK-STORM2-100W",
                4690000, 4190000,
                "products/pin-du-phong-shargeek-storm-2-100w-main.jpg",
                "Thiết kế phong cách cyberpunk vỏ trong suốt lộ trần bo mạch và cell pin Samsung, màn hình màu IPS hiển thị biểu đồ dòng sạc công suất thực tế, sạc nhanh 100W cho laptop.",
                20, catAccessories?.Id, brandOther.Id, 4.8, 22
            );

            // ==========================================
            // 5. THIẾT BỊ ĐEO THÔNG MINH (6 sản phẩm)
            // ==========================================
            AddProductIfMissing(
                "APPLE-WATCH-ULTRA-2",
                "Đồng hồ thể thao dã ngoại Apple Watch Ultra 2 GPS + Cellular 49mm Vỏ Titanium",
                "apple-watch-ultra-2-titanium",
                "APPLE-AWU2-49-OCEAN",
                22490000, 20990000,
                "products/apple-watch-ultra-2-titanium-main.jpg",
                "Vỏ Titanium hàng không 49mm siêu bền, màn hình Always-On sáng kỷ lục 3000 nits, chip S9 SiP với thao tác Chạm Hai Lần Double Tap, pin 72 giờ nguồn điện thấp, lặn sâu 100m.",
                25, catWearables?.Id, brandApple.Id, 5.0, 40
            );

            AddProductIfMissing(
                "APPLE-WATCH-S10-46",
                "Đồng hồ thông minh Apple Watch Series 10 Nhôm GPS 46mm Viền Siêu Mỏng",
                "apple-watch-series-10-nhom-gps",
                "APPLE-AWS10-46-JET",
                11490000, 10490000,
                "products/apple-watch-series-10-nhom-gps-main.jpg",
                "Thiết kế mỏng hơn 10% với mặt kính Wide-angle OLED hiển thị góc nhìn rộng sáng hơn 40%, tính năng phát hiện chứng ngưng thở khi ngủ tân tiến, sạc nhanh 80% trong 30 phút.",
                40, catWearables?.Id, brandApple.Id, 4.9, 52
            );

            AddProductIfMissing(
                "GARMIN-FENIX-8-47",
                "Đồng hồ đa môn thể thao chuyên nghiệp Garmin Fenix 8 AMOLED 47mm Sapphire Titanium",
                "garmin-fenix-8-amoled-47mm",
                "GARMIN-FN8-47-TIT",
                27990000, 25990000,
                "products/garmin-fenix-8-amoled-47mm-main.jpg",
                "Màn hình rực rỡ AMOLED 1.4 inch kính Sapphire, viền Titanium DLC chống trầy, các nút bấm chống nước chuẩn lặn sâu 40m, tích hợp mic đàm thoại và đèn pin LED trợ sáng.",
                20, catWearables?.Id, brandGarmin.Id, 5.0, 29
            );

            AddProductIfMissing(
                "GARMIN-EPIX-PRO-51",
                "Đồng hồ thể thao cao cấp Garmin Epix Pro (Gen 2) Sapphire 51mm Màn AMOLED",
                "garmin-epix-pro-gen-2-sapphire",
                "GARMIN-EPXPRO-51-BLK",
                26490000, 23990000,
                "products/garmin-epix-pro-gen-2-sapphire-main.jpg",
                "Cảm biến nhịp tim Elevate Gen 5 chuẩn xác tối đa, đo chỉ số leo dốc Hill Score và sức bền Endurance Score chuyên sâu, bản đồ địa hình Topo đa lục địa, pin khủng 31 ngày.",
                18, catWearables?.Id, brandGarmin.Id, 4.9, 19
            );

            AddProductIfMissing(
                "SAMSUNG-WATCH-ULTRA",
                "Đồng hồ thể thao siêu bền Samsung Galaxy Watch Ultra 47mm LTE Vỏ Titanium",
                "samsung-galaxy-watch-ultra-47mm-lte",
                "SS-WULTRA-47-GRY",
                16990000, 14990000,
                "products/samsung-galaxy-watch-ultra-47mm-lte-main.jpg",
                "Thiết kế Cushion gối đệm đúc từ Titanium Grade 4 chịu nhiệt độ khắc nghiệt và áp suất nước 10 ATM, GPS tần số kép L1+L5 chính xác, còi báo động khẩn cấp 86dB, Galaxy AI theo dõi sức khỏe.",
                30, catWearables?.Id, brandSamsung.Id, 4.8, 31
            );

            AddProductIfMissing(
                "XIAOMI-BAND-9-PRO",
                "Vòng đeo tay thể thao thông minh Xiaomi Smart Band 9 Pro Khung kim loại GPS",
                "xiaomi-smart-band-9-pro",
                "MI-BAND9PRO-BLK",
                1890000, 1590000,
                "products/xiaomi-smart-band-9-pro-main.jpg",
                "Màn hình AMOLED 1.74 inch 60Hz độ sáng đỉnh 1200 nits, khung viền hợp kim nhôm kim loại cao cấp, định vị độc lập 5 vệ tinh GNSS không cần mang điện thoại, pin 21 ngày bền bỉ.",
                65, catWearables?.Id, brandXiaomi.Id, 4.8, 48
            );

            if (newProducts.Any())
            {
                await _context.Products.AddRangeAsync(newProducts);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully seeded {Count} featured products across 5 categories", newProducts.Count);
            }

            // ==========================================
            // SEED SPECIFICATIONS CHO CÁC SẢN PHẨM MỚI
            // ==========================================
            await SeedFeaturedProductSpecificationsAsync();

            // ==========================================
            // SEED VARIANTS (COLORS, SIZES)
            // ==========================================
            await SeedFeaturedProductVariantsAsync();

            // ==========================================
            // SEED GALLERY IMAGES (3 ẢNH PHỤ MỖI SP)
            // ==========================================
            await SeedFeaturedProductImagesAsync();

            // ==========================================
            // SEED REVIEWS MẪU CHO SẢN PHẨM MỚI
            // ==========================================
            await SeedFeaturedProductReviewsAsync(users);
        }

        private async Task SeedFeaturedProductSpecificationsAsync()
        {
            var products = await _context.Products.ToListAsync();
            var existingSpecProductIds = await _context.ProductSpecifications.Select(s => s.ProductId).Distinct().ToListAsync();
            var specs = new List<ProductSpecification>();

            void AddSpecs(string slug, params (string Name, string Value)[] items)
            {
                var prod = products.FirstOrDefault(p => p.Slug == slug);
                if (prod == null || existingSpecProductIds.Contains(prod.Id)) return;

                foreach (var (name, val) in items)
                {
                    specs.Add(new ProductSpecification
                    {
                        ProductId = prod.Id,
                        Name = name,
                        Value = val
                    });
                }
            }

            // Laptop & Tablet Specs
            AddSpecs("macbook-pro-16-inch-m3-max-36gb-1tb",
                ("Màn hình", "16.2 inch Liquid Retina XDR (3456 x 2234), 120Hz ProMotion, 1600 nits"),
                ("Vi xử lý (CPU)", "Apple M3 Max (14 lõi CPU, 30 lõi GPU, 16 lõi Neural Engine)"),
                ("RAM", "36GB Unified Memory"),
                ("Ổ cứng", "1TB SSD NVMe tốc độ 7.4GB/s"),
                ("Pin & Sạc", "100Wh lên đến 22 giờ, Sạc nhanh MagSafe 3 140W"),
                ("Trọng lượng", "2.16 kg")
            );

            AddSpecs("macbook-air-13-inch-m3-16gb-512gb",
                ("Màn hình", "13.6 inch Liquid Retina (2560 x 1664) 500 nits True Tone"),
                ("Vi xử lý (CPU)", "Apple M3 (8 lõi CPU, 10 lõi GPU)"),
                ("RAM", "16GB Unified Memory"),
                ("Ổ cứng", "512GB SSD"),
                ("Độ mỏng & Trọng lượng", "11.3 mm, 1.24 kg"),
                ("Pin", "Lên đến 18 giờ xem video")
            );

            AddSpecs("ipad-pro-13-inch-m4-ultra-retina-oled-256gb",
                ("Màn hình", "13 inch Tandem OLED Ultra Retina XDR, ProMotion 10-120Hz, 1600 nits đỉnh"),
                ("Chipset", "Apple M4 với kiến trúc đồ họa GPU Dynamic Caching"),
                ("Độ mỏng", "5.1 mm (Mỏng nhất lịch sử Apple)"),
                ("Camera", "12MP Wide ƒ/1.8, LiDAR Scanner, Camera trước ngang Ultra Wide 12MP Center Stage"),
                ("Kết nối", "Wi-Fi 6E, Bluetooth 5.3, Thunderbolt / USB 4")
            );

            AddSpecs("asus-rog-zephyrus-g16-oled-gu605",
                ("Màn hình", "16 inch 2.5K (2560 x 1600) ROG Nebula OLED 240Hz 0.2ms 100% DCI-P3"),
                ("CPU", "Intel Core Ultra 9 185H (16 nhân, 22 luồng, Turbo 5.1GHz)"),
                ("Card đồ họa (VGA)", "NVIDIA GeForce RTX 4080 12GB GDDR6 (TGP 115W)"),
                ("RAM", "32GB LPDDR5X 7467MHz"),
                ("Tản nhiệt", "ROG Intelligent Cooling với buồng hơi và quạt Arc Flow Gen 2")
            );

            AddSpecs("dell-xps-16-9640-core-ultra-7-4k-oled",
                ("Màn hình", "16.3 inch 4K+ (3840 x 2400) OLED Touch cảm ứng, 400 nits, Gorilla Glass 3"),
                ("CPU", "Intel Core Ultra 7 155H với NPU Intel AI Boost"),
                ("VGA", "NVIDIA GeForce RTX 4060 8GB GDDR6"),
                ("Bàn rê chuột", "Kính liền mạch cảm ứng lực Haptic Touch"),
                ("Chất liệu", "Nhôm gia công CNC nguyên khối & kính cường lực")
            );

            AddSpecs("lenovo-thinkpad-x1-carbon-gen-12",
                ("Màn hình", "14 inch 2.8K (2880 x 1800) OLED 120Hz HDR 500 True Black 100% DCI-P3"),
                ("CPU", "Intel Core Ultra 7 155H"),
                ("RAM / Bộ nhớ", "32GB LPDDR5X / 1TB SSD PCIe Gen 4 NVMe"),
                ("Trọng lượng", "1.09 kg (Sợi Carbon & Hợp kim Magie đạt chuẩn độ bền MIL-STD 810H)"),
                ("Bảo mật", "Cảm biến vân tay Match-on-Chip & Camera IR hồng ngoại nhận diện khuôn mặt")
            );

            // Âm Thanh Specs
            AddSpecs("tai-nghe-sony-wh-1000xm5",
                ("Bộ xử lý chống ồn", "Bộ vi xử lý kép V1 và HD QN1 với 8 microphone đa hướng"),
                ("Củ loa (Driver)", "30mm màng loa sợi carbon tổng hợp cao cấp"),
                ("Định dạng âm thanh", "Hi-Res Audio, Hi-Res Wireless, LDAC, AAC, SBC, DSEE Extreme"),
                ("Thời lượng pin", "30 giờ (bật chống ồn), sạc nhanh 3 phút dùng 3 giờ"),
                ("Trọng lượng", "250g đệm tai giả da mềm mại")
            );

            AddSpecs("loa-marshall-stanmore-iii",
                ("Công suất", "80W (1 Woofer 50W Class D + 2 Tweeter 15W Class D)"),
                ("Tần số đáp ứng", "45 – 20,000 Hz"),
                ("Kết nối", "Bluetooth 5.2 (khoảng cách 10m), Cổng AUX 3.5mm, Cổng RCA"),
                ("Tính năng", "Dynamic Loudness cân bằng âm thanh theo âm lượng, Placement Compensation"),
                ("Kích thước & Trọng lượng", "350 x 203 x 188 mm / 4.25 kg")
            );

            AddSpecs("apple-airpods-pro-2-usb-c",
                ("Chip xử lý", "Apple H2 trong tai nghe, Apple U1 trong hộp sạc"),
                ("Chống ồn & Xuyên âm", "Active Noise Cancellation gấp 2 lần, Adaptive Audio, Conversation Awareness"),
                ("Chuẩn kháng nước bụi", "IP54 cho cả tai nghe và hộp sạc"),
                ("Pin & Hộp sạc", "6 giờ nghe liên tục (30 giờ kèm hộp), sạc MagSafe USB-C & Apple Watch Charger")
            );

            AddSpecs("tai-nghe-bose-quietcomfort-ultra",
                ("Công nghệ độc quyền", "Bose Immersive Audio âm thanh không gian 3D, CustomTune cá nhân hóa"),
                ("Chế độ nghe", "Quiet Mode (Chống ồn tối đa), Aware Mode (Xuyên âm), Immersion Mode"),
                ("Thời lượng pin", "Lên đến 24 giờ nghe nhạc, sạc nhanh qua cổng USB-C"),
                ("Chất liệu", "Khung nhôm đúc anodized, đệm tai giả da cao cấp siêu nhẹ")
            );

            AddSpecs("loa-jbl-boombox-3-wifi",
                ("Công suất", "180W RMS (Cắm điện trực tiếp) / 136W RMS (Chạy pin)"),
                ("Âm thanh vòm", "Dolby Atmos 3D qua kết nối Wi-Fi stream nhạc Lossless"),
                ("Kháng nước bụi", "Chuẩn IP67 chống nước ngập và chống bụi tuyệt đối"),
                ("Pin", "Thời gian chơi nhạc liên tục đến 24 giờ, hỗ trợ sạc ngược cho điện thoại")
            );

            AddSpecs("apple-airpods-max-usb-c",
                ("Driver âm thanh", "Củ loa Dynamic 40mm do Apple tự thiết kế với nam châm Neodymium kép"),
                ("Vi xử lý", "Chip Apple H1 ở mỗi bên chụp tai (10 lõi xử lý âm thanh)"),
                ("Chống ồn", "Active Noise Cancellation với 8 microphone khử ồn chuyên sâu"),
                ("Vật liệu chế tác", "Vòm lưới đan knit-mesh thoáng khí, khung thép không gỉ bọc vật liệu cao cấp")
            );

            // Nhà Thông Minh Specs
            AddSpecs("hub-matter-aqara-m3",
                ("Giao thức kết nối", "Matter Controller, Thread Border Router, Zigbee 3.0, Wi-Fi 2.4/5GHz, Bluetooth 5.1"),
                ("Hồng ngoại", "Bộ phát hồng ngoại 360 độ góc rộng điều khiển TV, điều hòa"),
                ("Nguồn điện", "Cấp nguồn qua cổng USB-C 5V-2A hoặc cấp nguồn qua mạng Ethernet PoE"),
                ("Khả năng lưu trữ", "Xử lý tự động hóa cục bộ Local Automation mượt mà không cần internet")
            );

            AddSpecs("khoa-cua-thong-minh-aqara-u200",
                ("Phương thức mở khóa", "Apple Home Key, Vân tay bán dẫn sinh trắc học, Mã số, Thẻ NFC, Chìa cơ, Ứng dụng"),
                ("Giao thức chuẩn", "Matter over Thread tiết kiệm điện năng tối đa"),
                ("Loại cửa tương thích", "Khóa retrofit lắp giữ nguyên ổ cơ ruột khóa Euro Profile tiêu chuẩn"),
                ("Tiêu chuẩn bảo vệ", "Bàn phím ngoài kháng nước IPX5, mã hóa bảo mật chuẩn ngân hàng")
            );

            AddSpecs("den-philips-hue-starter-kit-e27",
                ("Màu sắc ánh sáng", "16 triệu màu RGB & dải ánh sáng trắng ấm đến mát (2000K – 6500K)"),
                ("Độ sáng", "1100 Lumen (tương đương bóng sợi đốt 75W)"),
                ("Công suất tiêu thụ", "9.5W (tiết kiệm điện năng chuẩn A+)"),
                ("Tuổi thọ bóng", "25,000 giờ chiếu sáng (tương đương 15-20 năm sử dụng)")
            );

            AddSpecs("google-nest-hub-gen-2",
                ("Màn hình", "Cảm ứng LCD 7 inch (1024 x 600) với cảm biến cân bằng màu Ambient EQ"),
                ("Cảm biến radar", "Soli Motion Sense phân tích nhịp thở và cử chỉ tay không chạm"),
                ("Loa & Micro", "Củ loa toàn dải 43.5mm bass tăng 50%, 3 microphone trường xa thu giọng nói"),
                ("Trợ lý ảo", "Google Assistant tiếng Việt & tiếng Anh")
            );

            AddSpecs("apple-homepod-mini",
                ("Âm thanh", "Củ loa toàn dải nam châm neodymium và cặp tản âm thụ động kép khử lực"),
                ("Cảm biến phòng", "Cảm biến nhiệt độ và độ ẩm tích hợp bên trong"),
                ("Giao thức", "Wi-Fi 802.11n, Bluetooth 5.0, Thread Border Router, Matter Controller"),
                ("Kích thước & Cân nặng", "Cao 84.3 mm, Đường kính 97.9 mm, Nặng 345g")
            );

            AddSpecs("camera-aqara-hub-g3-ai-2k",
                ("Độ phân giải", "2K 2304 x 1296p góc nhìn siêu rộng với khả năng xoay ngang 360, xoay dọc 45 độ"),
                ("Trí tuệ nhân tạo (AI)", "NPU nhận diện khuôn mặt, phát hiện cử chỉ điều khiển nhà, nhận diện thú cưng"),
                ("Tích hợp Hub", "Zigbee 3.0 kết nối tối đa 128 cảm biến phụ kiện Aqara"),
                ("Hệ sinh thái", "Apple HomeKit Secure Video, Google Home, Alexa")
            );

            // Phụ Kiện Cao Cấp Specs
            AddSpecs("cu-sac-anker-prime-100w-gan",
                ("Tổng công suất", "100W Max"),
                ("Cổng kết nối", "2 x USB-C (Tối đa 100W mỗi cổng), 1 x USB-A (Tối đa 22.5W)"),
                ("Công nghệ sạc", "GaNPrime, PowerIQ 4.0 phân bổ công suất thông minh"),
                ("Công nghệ bảo vệ", "ActiveShield 2.0 kiểm soát nhiệt độ 3,000,000 lần/ngày"),
                ("Kích thước", "Nhỏ hơn 43% so với sạc 96W chính hãng")
            );

            AddSpecs("tram-sac-belkin-boostcharge-pro-3-in-1",
                ("Chứng nhận", "Official Apple Made for MagSafe (MFM), Made for Apple Watch (MFW)"),
                ("Công suất sạc", "iPhone 15W sạc nhanh không dây, Apple Watch 5W sạc nhanh, AirPods 5W"),
                ("Chất liệu", "Khung thép không gỉ đánh bóng cao cấp, chân đế bọc silicone đầm chắc chống trượt"),
                ("Đèn báo", "LED thông minh báo trạng thái sạc chuẩn xác")
            );

            AddSpecs("cap-ugreen-240w-type-c-to-c",
                ("Chuẩn hỗ trợ", "Power Delivery 3.1 (EPR), Qualcomm Quick Charge 4.0+"),
                ("Công suất tối đa", "240W (48V / 5A) sạc được từ điện thoại đến laptop gaming"),
                ("Tốc độ truyền dữ liệu", "480 Mbps (USB 2.0)"),
                ("Chất liệu hoàn thiện", "Vỏ hợp kim kẽm chống xước, dây bọc sợi dù nylon bện chịu tải uốn cong 20,000+ lần"),
                ("Chiều dài", "2 mét")
            );

            AddSpecs("chuot-logitech-mx-master-3s",
                ("Cảm biến", "Darkfield High Precision độ nhạy 200 – 8000 DPI (hoạt động trên kính dày >4mm)"),
                ("Nút bấm", "Quiet Clicks giảm 90% âm thanh bấm chuột"),
                ("Con lăn", "MagSpeed điện từ cuộn 1000 dòng/giây & Con lăn phụ ngón cái cuộn ngang"),
                ("Kết nối", "Bluetooth Low Energy & Đầu thu Logi Bolt USB, chuyển đổi mượt giữa 3 máy tính (Logi Flow)"),
                ("Thời lượng pin", "Pin sạc dùng 70 ngày, sạc nhanh 1 phút dùng 3 giờ")
            );

            AddSpecs("ban-phim-keychron-q1-pro",
                ("Chất liệu vỏ", "Nhôm nguyên khối 6063 gia công CNC cắt gọt chính xác từng chi tiết"),
                ("Cấu trúc phím", "Double Gasket Mount tiêu âm mềm mại, êm tai"),
                ("Mạch phím", "Hotswap xuôi (South-facing RGB), hỗ trợ switch 3-pin và 5-pin"),
                ("Phần mềm tùy biến", "Hỗ trợ firmware mã nguồn mở QMK / VIA lập trình macro mọi phím"),
                ("Kết nối", "Không dây Bluetooth 5.1 và có dây cáp Type-C rời")
            );

            AddSpecs("pin-du-phong-shargeek-storm-2-100w",
                ("Dung lượng pin", "25,600 mAh / 93.5Wh (Chuẩn điều kiện bay quốc tế TSA)"),
                ("Công suất cổng", "USB-C1 In/Out 100W, USB-C2 Out 30W, USB-A Out 18W, DC Port In/Out 75W điều chỉnh volt"),
                ("Màn hình", "Màn hình màu IPS hiển thị dòng điện, điện áp, biểu đồ công suất và nhiệt độ"),
                ("Vỏ ngoài", "Nhựa chống cháy Polycarbonate trong suốt chuẩn Cyberpunk")
            );

            // Thiết Bị Đeo Specs
            AddSpecs("apple-watch-ultra-2-titanium",
                ("Chất liệu vỏ", "Titanium chuẩn hàng không vũ trụ 49mm chống ăn mòn"),
                ("Màn hình", "Always-On Retina OLED độ sáng cực đại 3000 nits, mặt kính tinh thể Sapphire"),
                ("Chip vi xử lý", "S9 SiP lõi tứ Neural Engine, hỗ trợ cử chỉ Chạm Hai Lần (Double Tap)"),
                ("Chống nước & Lặn", "Chống nước 100m, chuẩn lặn thể thao EN13319 độ sâu 40m kèm cảm biến đo độ sâu"),
                ("Thời lượng pin", "36 giờ sử dụng thông thường, lên đến 72 giờ ở Chế độ nguồn điện thấp")
            );

            AddSpecs("apple-watch-series-10-nhom-gps",
                ("Màn hình", "OLED góc nhìn rộng Wide-angle OLED sáng hơn 40% ở góc nghiêng, viền siêu mỏng"),
                ("Độ mỏng", "9.7 mm (Mỏng hơn 10% so với thế hệ trước)"),
                ("Tính năng sức khỏe", "Thông báo ngưng thở khi ngủ Sleep Apnea, điện tâm đồ ECG, đo oxy máu SpO2, đo nhiệt độ cổ tay"),
                ("Sạc nhanh", "Sạc 80% pin chỉ trong khoảng 30 phút")
            );

            AddSpecs("garmin-fenix-8-amoled-47mm",
                ("Màn hình", "1.4 inch AMOLED cảm ứng rực rỡ sắc nét phủ kính Sapphire chống trầy"),
                ("Khung viền", "Titanium phủ lớp DLC siêu cứng, các nút bấm kín kháng áp suất nước 40m"),
                ("Đèn pin trợ sáng", "Đèn pin LED trắng và đỏ tích hợp ngay trên đỉnh viền đồng hồ"),
                ("Tính năng gọi điện", "Loa ngoài và microphone tích hợp đàm thoại trực tiếp qua Bluetooth"),
                ("Thời lượng pin", "16 ngày ở chế độ đồng hồ thông minh, 47 giờ GPS liên tục")
            );

            AddSpecs("garmin-epix-pro-gen-2-sapphire",
                ("Cảm biến tim", "Elevate Gen 5 đa kênh mới nhất của Garmin đo nhịp tim cực kỳ chính xác khi vận động nặng"),
                ("Bản đồ điều hướng", "Bản đồ địa hình Topo đa lục địa tải sẵn, hiển thị dẫn đường ngã rẽ trực quan"),
                ("Chỉ số tập luyện", "Điểm số leo dốc Hill Score, Điểm sức bền Endurance Score, Báo cáo buổi sáng Morning Report"),
                ("Vật liệu", "Khung viền Titanium đen Carbon DLC kết hợp kính Sapphire chống xước tuyệt đối")
            );

            AddSpecs("samsung-galaxy-watch-ultra-47mm-lte",
                ("Độ bền tiêu chuẩn", "Titanium Grade 4, chuẩn chống nước 10 ATM / IP68, độ bền quân đội MIL-STD-810H, chịu nhiệt -20°C đến 55°C"),
                ("Nút tác vụ nhanh", "Nút Quick Button màu cam kích hoạt bài tập tức thì hoặc còi báo động khẩn cấp 86dB"),
                ("Định vị", "GPS tần số kép L1 + L5 định vị chuẩn xác cả trong thành phố nhà cao tầng"),
                ("Trí tuệ nhân tạo AI", "Galaxy AI phân tích Điểm Năng Lượng Energy Score và gợi ý bài tập phục hồi")
            );

            AddSpecs("xiaomi-smart-band-9-pro",
                ("Màn hình", "AMOLED 1.74 inch độ phân giải 336 x 480 pixel, tần số quét 60Hz mượt mà, độ sáng 1200 nits"),
                ("Định vị độc lập", "Tích hợp chip GPS độc lập hỗ trợ 5 hệ thống vệ tinh GNSS (BDS, GPS, GLONASS, Galileo, QZSS)"),
                ("Cảm biến sức khỏe", "Đo nhịp tim quang học 24/7, nồng độ oxy trong máu SpO2, theo dõi giấc ngủ khoa học"),
                ("Pin", "Dung lượng 350 mAh cho thời lượng sử dụng lên đến 21 ngày")
            );

            if (specs.Any())
            {
                await _context.ProductSpecifications.AddRangeAsync(specs);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Seeded {Count} specifications for featured products", specs.Count);
            }
        }

        private async Task SeedFeaturedProductVariantsAsync()
        {
            var products = await _context.Products.ToListAsync();
            var existingVariantProductIds = await _context.ProductVariants.Select(v => v.ProductId).Distinct().ToListAsync();
            var variants = new List<ProductVariants>();

            void AddVariant(string slug, string[] colors, string[] sizes)
            {
                var prod = products.FirstOrDefault(p => p.Slug == slug);
                if (prod == null || existingVariantProductIds.Contains(prod.Id)) return;

                variants.Add(new ProductVariants
                {
                    ProductId = prod.Id,
                    Colors = colors.Select(c => new ProductColor { Color = c }).ToList(),
                    Sizes = sizes.Select(s => new ProductSize { Size = s }).ToList()
                });
            }

            // Laptop variants
            AddVariant("macbook-pro-16-inch-m3-max-36gb-1tb", new[] { "Đen Không Gian (Space Black)", "Bạc Ánh Kim (Silver)" }, new[] { "36GB / 1TB", "48GB / 1TB" });
            AddVariant("macbook-air-13-inch-m3-16gb-512gb", new[] { "Xanh Nửa Đêm (Midnight)", "Ánh Sao (Starlight)", "Xám Không Gian", "Bạc" }, new[] { "16GB / 512GB" });
            AddVariant("ipad-pro-13-inch-m4-ultra-retina-oled-256gb", new[] { "Đen Không Gian", "Bạc" }, new[] { "256GB WiFi", "512GB WiFi" });
            AddVariant("asus-rog-zephyrus-g16-oled-gu605", new[] { "Xám Eclipse Gray", "Trắng Platinum White" }, new[] { "32GB / 1TB SSD" });
            AddVariant("dell-xps-16-9640-core-ultra-7-4k-oled", new[] { "Bạc Bạch Kim (Platinum)", "Than Chì (Graphite)" }, new[] { "32GB / 1TB OLED" });
            AddVariant("lenovo-thinkpad-x1-carbon-gen-12", new[] { "Đen Nhám Carbon (Deep Black)" }, new[] { "32GB / 1TB 2.8K OLED" });

            // Âm thanh variants
            AddVariant("tai-nghe-sony-wh-1000xm5", new[] { "Bạc Ánh Kim", "Đen Cổ Điển", "Xanh Khói (Midnight Blue)" }, new[] { "Tiêu Chuẩn" });
            AddVariant("loa-marshall-stanmore-iii", new[] { "Nâu Cổ Điển (Brown)", "Đen Sang Trọng (Black)", "Kem (Cream)" }, new[] { "Tiêu Chuẩn 80W" });
            AddVariant("apple-airpods-pro-2-usb-c", new[] { "Trắng Tinh Khiết" }, new[] { "Free Size (4 cặp đệm XS/S/M/L)" });
            AddVariant("tai-nghe-bose-quietcomfort-ultra", new[] { "Trắng Khói (White Smoke)", "Đen (Black)", "Cát Vàng (Sandstone)" }, new[] { "Tiêu Chuẩn" });
            AddVariant("loa-jbl-boombox-3-wifi", new[] { "Đen Nhám" }, new[] { "Tiêu Chuẩn 180W" });
            AddVariant("apple-airpods-max-usb-c", new[] { "Midnight", "Starlight", "Blue", "Purple", "Orange" }, new[] { "Tiêu Chuẩn" });

            // Nhà thông minh variants
            AddVariant("hub-matter-aqara-m3", new[] { "Đen Nhám Cao Cấp" }, new[] { "Bộ Hub Độc Lập" });
            AddVariant("khoa-cua-thong-minh-aqara-u200", new[] { "Bạc (Silver)", "Xám Không Gian (Space Gray)" }, new[] { "Bộ Kit Đầy Đủ" });
            AddVariant("den-philips-hue-starter-kit-e27", new[] { "16 Triệu Màu (Full Color)" }, new[] { "Bộ 3 Bóng + 1 Hue Bridge" });
            AddVariant("google-nest-hub-gen-2", new[] { "Than Chì (Charcoal)", "Phấn Trắng (Chalk)" }, new[] { "Màn Hình 7 Inch" });
            AddVariant("apple-homepod-mini", new[] { "Trắng", "Xám Không Gian", "Xanh Dương", "Vàng", "Cam" }, new[] { "Tiêu Chuẩn" });
            AddVariant("camera-aqara-hub-g3-ai-2k", new[] { "Trắng Sứ" }, new[] { "Bản Quốc Tế 2K" });

            // Phụ kiện variants
            AddVariant("cu-sac-anker-prime-100w-gan", new[] { "Đen Kim Loại", "Bạc Băng Giá" }, new[] { "100W GaN" });
            AddVariant("tram-sac-belkin-boostcharge-pro-3-in-1", new[] { "Trắng Tinh Tế", "Đen Huyền Bí" }, new[] { "Bản Sạc Nhanh 15W" });
            AddVariant("cap-ugreen-240w-type-c-to-c", new[] { "Xám Không Gian" }, new[] { "Chiều Dài 2M", "Chiều Dài 1M" });
            AddVariant("chuot-logitech-mx-master-3s", new[] { "Than Chì (Graphite)", "Xám Nhạt (Pale Grey)" }, new[] { "Tay Phải Công Thái Học" });
            AddVariant("ban-phim-keychron-q1-pro", new[] { "Đen Carbon", "Trắng Vỏ Sò (Shell White)" }, new[] { "Red Switch (Êm)", "Brown Switch (Khấc)" });
            AddVariant("pin-du-phong-shargeek-storm-2-100w", new[] { "Trong Suốt Cyberpunk" }, new[] { "25600mAh 100W" });

            // Thiết bị đeo variants
            AddVariant("apple-watch-ultra-2-titanium", new[] { "Titan Tự Nhiên", "Titan Đen (Black Titanium)" }, new[] { "Dây Ocean Cam", "Dây Alpine Loop", "Dây Trail Loop" });
            AddVariant("apple-watch-series-10-nhom-gps", new[] { "Đen Bóng (Jet Black)", "Vàng Hồng (Rose Gold)", "Bạc" }, new[] { "42mm", "46mm" });
            AddVariant("garmin-fenix-8-amoled-47mm", new[] { "Titanium Xám DLC", "Titanium Bạc" }, new[] { "47mm Sapphire" });
            AddVariant("garmin-epix-pro-gen-2-sapphire", new[] { "Đen Carbon DLC" }, new[] { "51mm Sapphire" });
            AddVariant("samsung-galaxy-watch-ultra-47mm-lte", new[] { "Xám Titan (Titanium Gray)", "Trắng Titan", "Bạc Titan" }, new[] { "47mm LTE" });
            AddVariant("xiaomi-smart-band-9-pro", new[] { "Đen Ánh Kim (Obsidian Black)", "Bạc Ánh Trăng", "Vàng Hồng" }, new[] { "Tiêu Chuẩn Pro" });

            if (variants.Any())
            {
                await _context.ProductVariants.AddRangeAsync(variants);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Seeded {Count} product variants for featured products", variants.Count);
            }
        }

        private async Task SeedFeaturedProductImagesAsync()
        {
            var products = await _context.Products.ToListAsync();
            var existingImageProductIds = await _context.ProductImages.Select(i => i.ProductId).Distinct().ToListAsync();
            var images = new List<ProductImage>();

            var featuredSlugs = new[]
            {
                // Laptop
                "macbook-pro-16-inch-m3-max-36gb-1tb",
                "macbook-air-13-inch-m3-16gb-512gb",
                "ipad-pro-13-inch-m4-ultra-retina-oled-256gb",
                "asus-rog-zephyrus-g16-oled-gu605",
                "dell-xps-16-9640-core-ultra-7-4k-oled",
                "lenovo-thinkpad-x1-carbon-gen-12",
                // Audio
                "tai-nghe-sony-wh-1000xm5",
                "loa-marshall-stanmore-iii",
                "apple-airpods-pro-2-usb-c",
                "tai-nghe-bose-quietcomfort-ultra",
                "loa-jbl-boombox-3-wifi",
                "apple-airpods-max-usb-c",
                // Smart Home
                "hub-matter-aqara-m3",
                "khoa-cua-thong-minh-aqara-u200",
                "den-philips-hue-starter-kit-e27",
                "google-nest-hub-gen-2",
                "apple-homepod-mini",
                "camera-aqara-hub-g3-ai-2k",
                // Accessories
                "cu-sac-anker-prime-100w-gan",
                "tram-sac-belkin-boostcharge-pro-3-in-1",
                "cap-ugreen-240w-type-c-to-c",
                "chuot-logitech-mx-master-3s",
                "ban-phim-keychron-q1-pro",
                "pin-du-phong-shargeek-storm-2-100w",
                // Wearables
                "apple-watch-ultra-2-titanium",
                "apple-watch-series-10-nhom-gps",
                "garmin-fenix-8-amoled-47mm",
                "garmin-epix-pro-gen-2-sapphire",
                "samsung-galaxy-watch-ultra-47mm-lte",
                "xiaomi-smart-band-9-pro"
            };

            foreach (var slug in featuredSlugs)
            {
                var prod = products.FirstOrDefault(p => p.Slug == slug);
                if (prod == null || existingImageProductIds.Contains(prod.Id)) continue;

                // 3 ảnh phụ theo đúng định dạng
                images.Add(new ProductImage { ProductId = prod.Id, Url = $"products/gallery/{slug}-detail.jpg" });
                images.Add(new ProductImage { ProductId = prod.Id, Url = $"products/gallery/{slug}-angle.jpg" });
                images.Add(new ProductImage { ProductId = prod.Id, Url = $"products/gallery/{slug}-lifestyle.jpg" });
            }

            if (images.Any())
            {
                await _context.ProductImages.AddRangeAsync(images);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Seeded {Count} gallery images for featured products", images.Count);
            }
        }

        private async Task SeedFeaturedProductReviewsAsync(List<ApplicationUser> users)
        {
            if (!users.Any()) return;

            var products = await _context.Products.ToListAsync();
            var existingReviewProductIds = await _context.Reviews.Select(r => r.ProductId).Distinct().ToListAsync();
            var reviews = new List<Review>();

            var featuredSlugs = new[]
            {
                "macbook-pro-16-inch-m3-max-36gb-1tb",
                "macbook-air-13-inch-m3-16gb-512gb",
                "ipad-pro-13-inch-m4-ultra-retina-oled-256gb",
                "asus-rog-zephyrus-g16-oled-gu605",
                "dell-xps-16-9640-core-ultra-7-4k-oled",
                "lenovo-thinkpad-x1-carbon-gen-12",
                "tai-nghe-sony-wh-1000xm5",
                "loa-marshall-stanmore-iii",
                "apple-airpods-pro-2-usb-c",
                "tai-nghe-bose-quietcomfort-ultra",
                "loa-jbl-boombox-3-wifi",
                "apple-airpods-max-usb-c",
                "hub-matter-aqara-m3",
                "khoa-cua-thong-minh-aqara-u200",
                "den-philips-hue-starter-kit-e27",
                "google-nest-hub-gen-2",
                "apple-homepod-mini",
                "camera-aqara-hub-g3-ai-2k",
                "cu-sac-anker-prime-100w-gan",
                "tram-sac-belkin-boostcharge-pro-3-in-1",
                "cap-ugreen-240w-type-c-to-c",
                "chuot-logitech-mx-master-3s",
                "ban-phim-keychron-q1-pro",
                "pin-du-phong-shargeek-storm-2-100w",
                "apple-watch-ultra-2-titanium",
                "apple-watch-series-10-nhom-gps",
                "garmin-fenix-8-amoled-47mm",
                "garmin-epix-pro-gen-2-sapphire",
                "samsung-galaxy-watch-ultra-47mm-lte",
                "xiaomi-smart-band-9-pro"
            };

            var comments = new[]
            {
                "Sản phẩm đóng gói rất cẩn thận, hoàn thiện sắc sảo đến từng chi tiết. Trải nghiệm tuyệt vời!",
                "Giao hàng hỏa tốc trong 2 giờ tại TP.HCM. Hàng chính hãng nguyên seal, tem bảo hành đầy đủ.",
                "Đúng như mô tả, chất lượng vượt xa mong đợi. Shop tư vấn rất nhiệt tình và chuyên nghiệp.",
                "Thiết kế tối giản đẳng cấp, dùng cực kỳ êm ái và mượt mà. Đáng từng đồng bỏ ra!"
            };

            var rand = new Random();

            foreach (var slug in featuredSlugs)
            {
                var prod = products.FirstOrDefault(p => p.Slug == slug);
                if (prod == null || existingReviewProductIds.Contains(prod.Id)) continue;

                var sampleUsers = users.OrderBy(_ => rand.Next()).Take(Math.Min(2, users.Count)).ToList();
                for (int i = 0; i < sampleUsers.Count; i++)
                {
                    var u = sampleUsers[i];
                    reviews.Add(new Review
                    {
                        Id = Guid.NewGuid(),
                        UserName = u.UserName ?? "Khách Hàng",
                        UserAvatar = "users/avatar-20250521154845412-fd9c4c.jpg",
                        Rating = 5,
                        Date = DateTime.Now.AddDays(-rand.Next(2, 20)),
                        Content = comments[rand.Next(comments.Length)],
                        Likes = rand.Next(3, 25),
                        Replies = 0,
                        IsVerified = true,
                        HelpfulCount = rand.Next(2, 12),
                        ProductId = prod.Id,
                        ApplicationUserId = u.Id
                    });
                }
            }

            if (reviews.Any())
            {
                await _context.Reviews.AddRangeAsync(reviews);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Seeded {Count} reviews for featured products", reviews.Count);
            }
        }
    }
}
