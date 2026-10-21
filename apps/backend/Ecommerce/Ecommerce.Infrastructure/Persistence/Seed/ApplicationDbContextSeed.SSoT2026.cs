using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Persistence.Seed
{
    public partial class ApplicationDbContextSeed
    {
        public async Task SeedShowroomsAsync()
        {
            _logger.LogInformation("Seeding SSoT 2026 45 Showrooms and Inventory");

            if (!await _context.Showrooms.AnyAsync())
            {
                var showrooms = new List<Showroom>();

                // Flagship Showrooms (Core O2O Hubs)
                showrooms.Add(new Showroom
                {
                    Code = "SR-HCM-01",
                    Name = "Showroom Flagship Quận 1 - Lê Lợi",
                    Region = "HCM",
                    City = "TP. Hồ Chí Minh",
                    District = "Quận 1",
                    Ward = "Phường Bến Nghé",
                    Address = "123 Lê Lợi, Phường Bến Nghé, Quận 1",
                    Phone = "1800 6868",
                    OpeningHours = "08:00 - 21:30 (Cả CN & Lễ)",
                    Latitude = 10.7735,
                    Longitude = 106.6990,
                    GoogleMapIframeUrl = "https://maps.google.com/?q=10.7735,106.6990",
                    IsFlagship = true,
                    HasInstantPickup = true,
                    IsActive = true,
                    DisplayOrder = 1
                });

                showrooms.Add(new Showroom
                {
                    Code = "SR-HN-01",
                    Name = "Showroom Flagship Hoàn Kiếm - Tràng Tiền",
                    Region = "HN",
                    City = "Hà Nội",
                    District = "Quận Hoàn Kiếm",
                    Ward = "Phường Tràng Tiền",
                    Address = "54 Tràng Tiền, Quận Hoàn Kiếm",
                    Phone = "1800 6868",
                    OpeningHours = "08:00 - 21:30 (Cả CN & Lễ)",
                    Latitude = 21.0250,
                    Longitude = 105.8560,
                    GoogleMapIframeUrl = "https://maps.google.com/?q=21.0250,105.8560",
                    IsFlagship = true,
                    HasInstantPickup = true,
                    IsActive = true,
                    DisplayOrder = 2
                });

                showrooms.Add(new Showroom
                {
                    Code = "SR-HN-02",
                    Name = "Showroom Cầu Giấy - Xuân Thủy",
                    Region = "HN",
                    City = "Hà Nội",
                    District = "Quận Cầu Giấy",
                    Ward = "Phường Dịch Vọng Hậu",
                    Address = "144 Xuân Thủy, Quận Cầu Giấy",
                    Phone = "1800 6868",
                    OpeningHours = "08:00 - 21:30 (Cả CN & Lễ)",
                    Latitude = 21.0370,
                    Longitude = 105.7830,
                    IsFlagship = false,
                    HasInstantPickup = true,
                    IsActive = true,
                    DisplayOrder = 3
                });

                showrooms.Add(new Showroom
                {
                    Code = "SR-HN-03",
                    Name = "Showroom Đống Đa - Thái Hà",
                    Region = "HN",
                    City = "Hà Nội",
                    District = "Quận Đống Đa",
                    Ward = "Phường Trung Liệt",
                    Address = "178 Thái Hà, Quận Đống Đa",
                    Phone = "1800 6868",
                    OpeningHours = "08:00 - 21:30 (Cả CN & Lễ)",
                    Latitude = 21.0118,
                    Longitude = 105.8190,
                    IsFlagship = false,
                    HasInstantPickup = true,
                    IsActive = true,
                    DisplayOrder = 4
                });

                showrooms.Add(new Showroom
                {
                    Code = "SR-HCM-02",
                    Name = "Showroom Quận 10 - 3 Tháng 2",
                    Region = "HCM",
                    City = "TP. Hồ Chí Minh",
                    District = "Quận 10",
                    Ward = "Phường 12",
                    Address = "280 Đường 3 Tháng 2, Phường 12, Quận 10",
                    Phone = "1800 6868",
                    OpeningHours = "08:00 - 21:30 (Cả CN & Lễ)",
                    Latitude = 10.7710,
                    Longitude = 106.6690,
                    IsFlagship = false,
                    HasInstantPickup = true,
                    IsActive = true,
                    DisplayOrder = 5
                });

                showrooms.Add(new Showroom
                {
                    Code = "SR-HCM-03",
                    Name = "Showroom Bình Thạnh - Bạch Đằng",
                    Region = "HCM",
                    City = "TP. Hồ Chí Minh",
                    District = "Quận Bình Thạnh",
                    Ward = "Phường 24",
                    Address = "135 Bạch Đằng, Quận Bình Thạnh",
                    Phone = "1800 6868",
                    OpeningHours = "08:00 - 21:30 (Cả CN & Lễ)",
                    Latitude = 10.8020,
                    Longitude = 106.7030,
                    IsFlagship = false,
                    HasInstantPickup = true,
                    IsActive = true,
                    DisplayOrder = 6
                });

                showrooms.Add(new Showroom
                {
                    Code = "SR-HCM-04",
                    Name = "Showroom Quận 7 - Nguyễn Thị Thập",
                    Region = "HCM",
                    City = "TP. Hồ Chí Minh",
                    District = "Quận 7",
                    Ward = "Phường Tân Hưng",
                    Address = "468 Nguyễn Thị Thập, Quận 7",
                    Phone = "1800 6868",
                    OpeningHours = "08:00 - 21:30 (Cả CN & Lễ)",
                    Latitude = 10.7390,
                    Longitude = 106.7050,
                    IsFlagship = false,
                    HasInstantPickup = true,
                    IsActive = true,
                    DisplayOrder = 7
                });

                showrooms.Add(new Showroom
                {
                    Code = "SR-DN-01",
                    Name = "Showroom Flagship Đà Nẵng - Nguyễn Văn Linh",
                    Region = "DN",
                    City = "Đà Nẵng",
                    District = "Quận Hải Châu",
                    Ward = "Phường Nam Dương",
                    Address = "152 Nguyễn Văn Linh, Quận Hải Châu",
                    Phone = "1800 6868",
                    OpeningHours = "08:00 - 21:30 (Cả CN & Lễ)",
                    Latitude = 16.0610,
                    Longitude = 108.2160,
                    IsFlagship = true,
                    HasInstantPickup = true,
                    IsActive = true,
                    DisplayOrder = 8
                });

                showrooms.Add(new Showroom
                {
                    Code = "SR-CT-01",
                    Name = "Showroom Flagship Cần Thơ - 30 Tháng 4",
                    Region = "CT",
                    City = "Cần Thơ",
                    District = "Quận Ninh Kiều",
                    Ward = "Phường An Lạc",
                    Address = "88 Đường 30 Tháng 4, Quận Ninh Kiều",
                    Phone = "1800 6868",
                    OpeningHours = "08:00 - 21:30 (Cả CN & Lễ)",
                    Latitude = 10.0310,
                    Longitude = 105.7830,
                    IsFlagship = true,
                    HasInstantPickup = true,
                    IsActive = true,
                    DisplayOrder = 9
                });

                showrooms.Add(new Showroom
                {
                    Code = "SR-HP-01",
                    Name = "Showroom Hải Phòng - Cầu Đất",
                    Region = "Other",
                    City = "Hải Phòng",
                    District = "Quận Ngô Quyền",
                    Ward = "Phường Cầu Đất",
                    Address = "92 Cầu Đất, Quận Ngô Quyền",
                    Phone = "1800 6868",
                    OpeningHours = "08:00 - 21:30 (Cả CN & Lễ)",
                    Latitude = 20.8560,
                    Longitude = 106.6850,
                    IsFlagship = false,
                    HasInstantPickup = true,
                    IsActive = true,
                    DisplayOrder = 10
                });

                // Generate remaining 35 showrooms to complete the 45-showroom nationwide network
                var additionalLocations = new (string code, string name, string region, string city, string district, string address)[]
                {
                    ("SR-HN-04", "Showroom Hà Đông - Quang Trung", "HN", "Hà Nội", "Quận Hà Đông", "110 Quang Trung, Hà Đông"),
                    ("SR-HN-05", "Showroom Thanh Xuân - Nguyễn Trãi", "HN", "Hà Nội", "Quận Thanh Xuân", "234 Nguyễn Trãi, Thanh Xuân"),
                    ("SR-HN-06", "Showroom Hai Bà Trưng - Phố Huế", "HN", "Hà Nội", "Quận Hai Bà Trưng", "180 Phố Huế, Hai Bà Trưng"),
                    ("SR-HN-07", "Showroom Long Biên - Nguyễn Văn Cừ", "HN", "Hà Nội", "Quận Long Biên", "350 Nguyễn Văn Cừ, Long Biên"),
                    ("SR-HN-08", "Showroom Ba Đình - Kim Mã", "HN", "Hà Nội", "Quận Ba Đình", "280 Kim Mã, Ba Đình"),
                    ("SR-HN-09", "Showroom Tây Hồ - Lạc Long Quân", "HN", "Hà Nội", "Quận Tây Hồ", "420 Lạc Long Quân, Tây Hồ"),
                    ("SR-HN-10", "Showroom Hoàng Mai - Giải Phóng", "HN", "Hà Nội", "Quận Hoàng Mai", "560 Giải Phóng, Hoàng Mai"),
                    ("SR-HN-11", "Showroom Bắc Từ Liêm - Hồ Tùng Mậu", "HN", "Hà Nội", "Quận Bắc Từ Liêm", "88 Hồ Tùng Mậu, Bắc Từ Liêm"),
                    ("SR-HN-12", "Showroom Nam Từ Liêm - Lê Đức Thọ", "HN", "Hà Nội", "Quận Nam Từ Liêm", "25 Lê Đức Thọ, Nam Từ Liêm"),
                    ("SR-HN-13", "Showroom Gia Lâm - Hà Huy Tập", "HN", "Hà Nội", "Huyện Gia Lâm", "75 Hà Huy Tập, Yên Viên, Gia Lâm"),
                    ("SR-HN-14", "Showroom Đông Anh - Cao Lỗ", "HN", "Hà Nội", "Huyện Đông Anh", "120 Cao Lỗ, Đông Anh"),
                    ("SR-HN-15", "Showroom Sơn Tây - Quang Trung", "HN", "Hà Nội", "Thị xã Sơn Tây", "45 Quang Trung, Sơn Tây"),

                    ("SR-HCM-05", "Showroom Tân Bình - Cộng Hòa", "HCM", "TP. Hồ Chí Minh", "Quận Tân Bình", "150 Cộng Hòa, Phường 12, Tân Bình"),
                    ("SR-HCM-06", "Showroom Gò Vấp - Quang Trung", "HCM", "TP. Hồ Chí Minh", "Quận Gò Vấp", "380 Quang Trung, Phường 10, Gò Vấp"),
                    ("SR-HCM-07", "Showroom Thủ Đức - Võ Văn Ngân", "HCM", "TP. Hồ Chí Minh", "TP. Thủ Đức", "215 Võ Văn Ngân, Linh Chiểu, Thủ Đức"),
                    ("SR-HCM-08", "Showroom Quận 5 - Trần Hưng Đạo", "HCM", "TP. Hồ Chí Minh", "Quận 5", "520 Trần Hưng Đạo, Phường 2, Quận 5"),
                    ("SR-HCM-09", "Showroom Quận 3 - Cách Mạng Tháng 8", "HCM", "TP. Hồ Chí Minh", "Quận 3", "330 Cách Mạng Tháng 8, Phường 10, Quận 3"),
                    ("SR-HCM-10", "Showroom Phú Nhuận - Phan Đăng Lưu", "HCM", "TP. Hồ Chí Minh", "Quận Phú Nhuận", "110 Phan Đăng Lưu, Phường 3, Phú Nhuận"),
                    ("SR-HCM-11", "Showroom Tân Phú - Lũy Bán Bích", "HCM", "TP. Hồ Chí Minh", "Quận Tân Phú", "285 Lũy Bán Bích, Hòa Thạnh, Tân Phú"),
                    ("SR-HCM-12", "Showroom Quận 6 - Hậu Giang", "HCM", "TP. Hồ Chí Minh", "Quận 6", "175 Hậu Giang, Phường 5, Quận 6"),
                    ("SR-HCM-13", "Showroom Quận 8 - Dương Bá Trạc", "HCM", "TP. Hồ Chí Minh", "Quận 8", "98 Dương Bá Trạc, Phường 2, Quận 8"),
                    ("SR-HCM-14", "Showroom Quận 11 - Ông Ích Khiêm", "HCM", "TP. Hồ Chí Minh", "Quận 11", "54 Ông Ích Khiêm, Phường 10, Quận 11"),
                    ("SR-HCM-15", "Showroom Quận 12 - Trường Chinh", "HCM", "TP. Hồ Chí Minh", "Quận 12", "42 Trường Chinh, Tân Hưng Thuận, Quận 12"),
                    ("SR-HCM-16", "Showroom Bình Tân - Tên Lửa", "HCM", "TP. Hồ Chí Minh", "Quận Bình Tân", "88 Tên Lửa, An Lạc A, Bình Tân"),

                    ("SR-BD-01", "Showroom Thủ Dầu Một - Đại Lộ Bình Dương", "Other", "Bình Dương", "TP. Thủ Dầu Một", "246 Đại Lộ Bình Dương, Thủ Dầu Một"),
                    ("SR-BD-02", "Showroom Thuận An - Nguyễn Văn Tiết", "Other", "Bình Dương", "TP. Thuận An", "15 Nguyễn Văn Tiết, Lái Thiêu, Thuận An"),
                    ("SR-DNI-01", "Showroom Biên Hòa - Đồng Khởi", "Other", "Đồng Nai", "TP. Biên Hòa", "320 Đồng Khởi, Tân Hiệp, Biên Hòa"),
                    ("SR-DNI-02", "Showroom Long Khánh - Hùng Vương", "Other", "Đồng Nai", "TP. Long Khánh", "88 Hùng Vương, Xuân Trung, Long Khánh"),
                    ("SR-VT-01", "Showroom Vũng Tàu - Ba Cu", "Other", "Bà Rịa - Vũng Tàu", "TP. Vũng Tàu", "142 Ba Cu, Phường 3, Vũng Tàu"),
                    ("SR-KH-01", "Showroom Nha Trang - Trần Phú", "Other", "Khánh Hòa", "TP. Nha Trang", "78 Trần Phú, Lộc Thọ, Nha Trang"),
                    ("SR-QN-01", "Showroom Hạ Long - Lê Thánh Tông", "Other", "Quảng Ninh", "TP. Hạ Long", "190 Lê Thánh Tông, Bạch Đằng, Hạ Long"),
                    ("SR-HUE-01", "Showroom Huế - Hùng Vương", "Other", "Thừa Thiên Huế", "TP. Huế", "56 Hùng Vương, Phú Nhuận, Huế"),
                    ("SR-DNA-02", "Showroom Ngũ Hành Sơn - Lê Văn Hiến", "DN", "Đà Nẵng", "Quận Ngũ Hành Sơn", "240 Lê Văn Hiến, Ngũ Hành Sơn"),
                    ("SR-GL-01", "Showroom Pleiku - Trần Phú", "Other", "Gia Lai", "TP. Pleiku", "40 Trần Phú, Tây Sơn, Pleiku"),
                    ("SR-DL-01", "Showroom Buôn Ma Thuột - Phan Chu Trinh", "Other", "Đắk Lắk", "TP. Buôn Ma Thuột", "92 Phan Chu Trinh, Thắng Lợi, Buôn Ma Thuột")
                };

                int orderCounter = 11;
                foreach (var loc in additionalLocations)
                {
                    showrooms.Add(new Showroom
                    {
                        Code = loc.code,
                        Name = loc.name,
                        Region = loc.region,
                        City = loc.city,
                        Province = loc.city,
                        District = loc.district,
                        Address = loc.address,
                        Phone = "1800 6868",
                        OpeningHours = "08:00 - 21:30 (Cả CN & Lễ)",
                        IsFlagship = false,
                        HasInstantPickup = true,
                        IsActive = true,
                        DisplayOrder = orderCounter++
                    });
                }

                await _context.Showrooms.AddRangeAsync(showrooms);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Seeded total of {ShowroomCount} Showrooms conforming to SSoT 2026", showrooms.Count);

                // Seed inventory for top products in Flagship showrooms
                var sampleProducts = await _context.Products.Take(5).ToListAsync();
                if (sampleProducts.Any())
                {
                    var inventories = new List<ShowroomInventory>();
                    foreach (var sr in showrooms.Take(10))
                    {
                        foreach (var prod in sampleProducts)
                        {
                            inventories.Add(new ShowroomInventory
                            {
                                ShowroomId = sr.Id,
                                ProductId = prod.Id,
                                Quantity = 25,
                                ReservedQuantity = 2,
                                IsAvailableFor2hDelivery = true
                            });
                        }
                    }
                    await _context.ShowroomInventories.AddRangeAsync(inventories);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Seeded sample showroom inventories");
                }
            }
            else
            {
                var showroomsToUpdate = await _context.Showrooms
                    .Where(s => string.IsNullOrEmpty(s.Province))
                    .ToListAsync();

                if (showroomsToUpdate.Any())
                {
                    foreach (var s in showroomsToUpdate)
                    {
                        s.Province = s.City;
                    }
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Updated Province for {Count} existing showrooms", showroomsToUpdate.Count);
                }
            }
        }

        public async Task SeedVouchersAsync()
        {
            _logger.LogInformation("Seeding Voucher Promotions");

            if (!await _context.Vouchers.AnyAsync(v => v.Code == "TECHVIP500"))
            {
                var vouchers = new List<Voucher>
                {
                    new Voucher
                    {
                        Code = "TECHVIP500",
                        DiscountType = "FixedAmount",
                        DiscountValue = 500000,
                        MinOrderValue = 5000000,
                        MaxDiscountAmount = 500000,
                        ValidFrom = DateTime.UtcNow.AddDays(-30),
                        ValidTo = DateTime.UtcNow.AddYears(1),
                        UsageLimit = 10000,
                        UsedCount = 88,
                        IsActive = true
                    },
                    new Voucher
                    {
                        Code = "WELCOME100",
                        DiscountType = "FixedAmount",
                        DiscountValue = 100000,
                        MinOrderValue = 1000000,
                        MaxDiscountAmount = 100000,
                        ValidFrom = DateTime.UtcNow.AddDays(-10),
                        ValidTo = DateTime.UtcNow.AddMonths(6),
                        UsageLimit = 5000,
                        UsedCount = 210,
                        IsActive = true
                    },
                    new Voucher
                    {
                        Code = "DIAMOND10",
                        DiscountType = "Percentage",
                        DiscountValue = 10,
                        MinOrderValue = 10000000,
                        MaxDiscountAmount = 2000000,
                        ValidFrom = DateTime.UtcNow.AddDays(-15),
                        ValidTo = DateTime.UtcNow.AddYears(1),
                        UsageLimit = 1000,
                        UsedCount = 45,
                        IsActive = true
                    }
                };

                await _context.Vouchers.AddRangeAsync(vouchers);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Seeded {VoucherCount} Vouchers including TECHVIP500", vouchers.Count);
            }
        }

        public async Task SeedFlashSalesAsync()
        {
            _logger.LogInformation("Seeding Active Flash Sale");

            if (!await _context.FlashSales.AnyAsync(fs => fs.IsActive))
            {
                var flashSale = new FlashSale
                {
                    Code = "FS-2026-NIGHT",
                    Title = "ĐẠI TIỆC CÔNG NGHỆ 2026 - FLASH SALE ĐÊM MUỘN",
                    Subtitle = "Giảm sốc tới 35% cho siêu phẩm Flagship - Duy nhất hôm nay",
                    BannerImageUrl = "https://nwwsveiehdmsgwgujalu.supabase.co/storage/v1/object/public/ecommerce-images/banners/flash-sale-hero.jpg",
                    StartTime = DateTime.UtcNow.AddHours(-2),
                    EndTime = DateTime.UtcNow.AddHours(22),
                    IsActive = true,
                    Priority = 1
                };

                await _context.FlashSales.AddAsync(flashSale);
                await _context.SaveChangesAsync();

                // Find MacBook Pro or flagship products to add to FlashSale
                var macbook = await _context.Products.FirstOrDefaultAsync(p => p.Name.Contains("MacBook Pro") || p.Slug.Contains("macbook"));
                var iphone = await _context.Products.FirstOrDefaultAsync(p => p.Name.Contains("iPhone") || p.Slug.Contains("iphone"));
                var otherProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id != (macbook != null ? macbook.Id : Guid.Empty) && p.Id != (iphone != null ? iphone.Id : Guid.Empty));

                var items = new List<FlashSaleItem>();
                if (macbook != null)
                {
                    items.Add(new FlashSaleItem
                    {
                        FlashSaleId = flashSale.Id,
                        ProductId = macbook.Id,
                        FlashSalePrice = 49990000,
                        OriginalPrice = 59990000,
                        TotalQuota = 50,
                        SoldCount = 34,
                        MaxPerCustomer = 1,
                        IsHeroFeatured = true,
                        BadgeText = "-17%",
                        DisplayOrder = 1
                    });
                }

                if (iphone != null)
                {
                    items.Add(new FlashSaleItem
                    {
                        FlashSaleId = flashSale.Id,
                        ProductId = iphone.Id,
                        FlashSalePrice = 31490000,
                        OriginalPrice = 34990000,
                        TotalQuota = 100,
                        SoldCount = 68,
                        MaxPerCustomer = 1,
                        IsHeroFeatured = false,
                        BadgeText = "-10%",
                        DisplayOrder = 2
                    });
                }

                if (otherProduct != null)
                {
                    items.Add(new FlashSaleItem
                    {
                        FlashSaleId = flashSale.Id,
                        ProductId = otherProduct.Id,
                        FlashSalePrice = Math.Round((otherProduct.Price * 0.85m) / 10000) * 10000,
                        OriginalPrice = otherProduct.Price,
                        TotalQuota = 30,
                        SoldCount = 12,
                        MaxPerCustomer = 2,
                        IsHeroFeatured = false,
                        BadgeText = "-15%",
                        DisplayOrder = 3
                    });
                }

                if (items.Any())
                {
                    await _context.FlashSaleItems.AddRangeAsync(items);
                    await _context.SaveChangesAsync();
                }

                _logger.LogInformation("Seeded active FlashSale with {ItemCount} items", items.Count);
            }
        }

        public async Task SeedProductAddOnsAsync()
        {
            _logger.LogInformation("Seeding Product Add-ons (AppleCare+)");

            if (!await _context.ProductAddOns.AnyAsync())
            {
                var addOns = new List<ProductAddOn>
                {
                    new ProductAddOn
                    {
                        Code = "APPLECARE_MBP14",
                        Name = "AppleCare+ 3 năm chính hãng Apple (Bảo hiểm rơi vỡ, vào nước)",
                        Description = "Gia hạn bảo hành chính hãng lên 3 năm, bảo hiểm tai nạn rơi vỡ không giới hạn số lần, hỗ trợ kỹ thuật Apple 24/7",
                        AddOnType = "ExtendedWarranty",
                        Price = 2490000,
                        OriginalPrice = 3990000,
                        DurationMonths = 36,
                        IsActive = true,
                        DisplayOrder = 1
                    },
                    new ProductAddOn
                    {
                        Code = "APPLECARE_IPHONE16",
                        Name = "AppleCare+ 2 năm chính hãng Apple cho iPhone",
                        Description = "Bảo hành 2 năm toàn diện, thay thế pin miễn phí khi dưới 80%, sửa chữa chính hãng tại Apple Store & AASP",
                        AddOnType = "ExtendedWarranty",
                        Price = 1890000,
                        OriginalPrice = 2490000,
                        DurationMonths = 24,
                        IsActive = true,
                        DisplayOrder = 2
                    },
                    new ProductAddOn
                    {
                        Code = "EXT_WARRANTY_24M",
                        Name = "Gói Bảo Hành Vàng ShopViet 24T (1 đổi 1 trong 15 phút)",
                        Description = "Cam kết 1 đổi 1 ngay tại 45 Showroom nếu phát sinh lỗi phần cứng từ nhà sản xuất trong suốt 24 tháng",
                        AddOnType = "ExtendedWarranty",
                        Price = 990000,
                        OriginalPrice = 1490000,
                        DurationMonths = 24,
                        IsActive = true,
                        DisplayOrder = 3
                    }
                };

                await _context.ProductAddOns.AddRangeAsync(addOns);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Seeded {AddOnCount} product add-ons", addOns.Count);
            }
        }

        public async Task SeedFlagshipProductSpecificationsAsync()
        {
            _logger.LogInformation("Seeding authentic specifications for Flagship SKUs (SSoT 2026)");

            // 1. Ensure MacBook Pro 14 M3 Pro exists
            var macbook14 = await _context.Products.FirstOrDefaultAsync(p => p.Slug == "macbook-pro-14-m3-pro");
            if (macbook14 == null)
            {
                var catLaptop = await _context.Categories.FirstOrDefaultAsync(c => c.Slug == "laptop" || c.Name.Contains("Laptop"));
                var brandApple = await _context.Brands.FirstOrDefaultAsync(b => b.Code == "Apple" || b.Name == "Apple");

                if (brandApple != null && catLaptop != null)
                {
                    macbook14 = Product.Create(
                        "MBP14-M3P-36-1TB",
                        "MacBook Pro 14 M3 Pro (36GB/1TB) Chính Hãng VN/A",
                        "macbook-pro-14-m3-pro",
                        "MBP14-M3P-36-1TB",
                        67990000,
                        61990000,
                        "products/macbook-pro-16-inch-m3-max-main.jpg",
                        "MacBook Pro 14 inch M3 Pro (12-Core CPU, 18-Core GPU), 36GB RAM, 1TB SSD. Màn hình Liquid Retina XDR 120Hz ProMotion 1600 nits đỉnh cao.",
                        20,
                        catLaptop.Id,
                        brandApple.Id
                    );
                    macbook14.UpdateRating(5.0, 142);
                    await _context.Products.AddAsync(macbook14);
                    await _context.SaveChangesAsync();
                }
            }

            var allProducts = await _context.Products.ToListAsync();

            Product? FindProduct(params string[] identifiers)
            {
                foreach (var id in identifiers)
                {
                    var found = allProducts.FirstOrDefault(p =>
                        p.Slug.Equals(id, StringComparison.OrdinalIgnoreCase) ||
                        p.Code.Equals(id, StringComparison.OrdinalIgnoreCase) ||
                        p.Name.Contains(id, StringComparison.OrdinalIgnoreCase));
                    if (found != null) return found;
                }
                return null;
            }

            var flagshipTargets = new (string[] keys, List<(string group, string name, string val, bool isKey, int order, string? filterKey)> specs)[]
            {
                // 1. MacBook Pro 14 M3 Pro & 16 M3 Max
                (
                    new[] { "macbook-pro-14-m3-pro", "macbook-pro-16-inch-m3-max-36gb-1tb", "MacBook Pro 14" },
                    new List<(string, string, string, bool, int, string?)>
                    {
                        ("Hiệu năng", "Vi xử lý (CPU)", "Apple M3 Pro (12-Core CPU: 6 nhân hiệu năng cao + 6 nhân tiết kiệm điện)", true, 1, "cpu"),
                        ("Hiệu năng", "Nhân đồ họa (GPU)", "18-Core GPU hỗ trợ Hardware-accelerated Ray Tracing & Mesh Shading", true, 2, "gpu"),
                        ("Hiệu năng", "Nhân AI (Neural Engine)", "16-Core Neural Engine (18 TOPS), băng thông bộ nhớ 150GB/s", false, 3, null),
                        ("Bộ nhớ & Lưu trữ", "Bộ nhớ RAM", "36GB Unified Memory (LPDDR5)", true, 4, "ram"),
                        ("Bộ nhớ & Lưu trữ", "Ổ cứng lưu trữ (SSD)", "1TB PCIe NVMe SSD siêu tốc (Tốc độ đọc lên tới 7.4GB/s)", true, 5, "ssd"),
                        ("Màn hình", "Màn hình hiển thị", "14.2 inch Liquid Retina XDR (3024 x 1964), 1.600 nits HDR, 120Hz ProMotion", true, 6, "display"),
                        ("Kết nối", "Cổng kết nối vật lý", "3x Thunderbolt 4 (USB-C), 1x HDMI 2.1, Khe thẻ SDXC, MagSafe 3, Jack 3.5mm", false, 7, null),
                        ("Kết nối", "Kết nối không dây", "Wi-Fi 6E (802.11ax) + Bluetooth 5.3", false, 8, null),
                        ("Tiện ích & Âm thanh", "Camera & Âm thanh", "Camera FaceTime HD 1080p • Hệ thống 6 loa Hi-Fi Spatial Audio Dolby Atmos", false, 9, null),
                        ("Tiện ích & Âm thanh", "Bàn phím & Bảo mật", "Magic Keyboard có đèn nền, cảm biến vân tay Touch ID", false, 10, null),
                        ("Pin & Sạc", "Pin & Sạc nhanh", "72.4 Wh Li-Po (Thời lượng lên tới 18 giờ), Sạc nhanh 96W USB-C Power Adapter", true, 11, null),
                        ("Thiết kế & Trọng lượng", "Kích thước & Trọng lượng", "31.26 x 22.12 x 1.55 cm • Trọng lượng 1.61 kg (Vỏ nhôm nguyên khối tái chế)", false, 12, null),
                        ("Hệ điều hành", "Hệ điều hành", "macOS Sequoia (Tích hợp sẵn bộ công cụ Apple Intelligence)", false, 13, null),
                        ("Bảo hành", "Chính sách bảo hành", "12 tháng chính hãng Apple + 12 tháng mở rộng độc quyền ShopViet (Tổng 24 tháng)", false, 14, null)
                    }
                ),

                // 2. iPhone 16 Pro Max
                (
                    new[] { "iphone-16-pro-max-256gb", "iPhone 16 Pro Max" },
                    new List<(string, string, string, bool, int, string?)>
                    {
                        ("Màn hình", "Màn hình", "6.9 inch Super Retina XDR OLED (2868 x 1320), 120Hz ProMotion, 2.000 nits", true, 1, "display"),
                        ("Hiệu năng", "Chipset (CPU)", "Apple A18 Pro 3nm thế hệ mới (6 lõi CPU + 6 lõi GPU)", true, 2, "cpu"),
                        ("Hiệu năng", "Nhân trí tuệ nhân tạo (NPU)", "16-Core Neural Engine thế hệ mới hỗ trợ Apple Intelligence", false, 3, null),
                        ("Bộ nhớ & Lưu trữ", "RAM", "8GB LPDDR5X", true, 4, "ram"),
                        ("Bộ nhớ & Lưu trữ", "Bộ nhớ trong", "256GB NVMe siêu tốc", true, 5, "rom"),
                        ("Camera", "Camera sau", "Chính 48MP Fusion ƒ/1.78 + Ultra Wide 48MP ƒ/2.2 + Telephoto 12MP 5x quang học", true, 6, null),
                        ("Camera", "Camera trước", "12MP TrueDepth ƒ/1.9 với Autofocus", false, 7, null),
                        ("Camera", "Quay video", "4K Dolby Vision ở tốc độ 120 fps, ProRes, Log video, Audio Mix", false, 8, null),
                        ("Pin & Sạc", "Pin & Sạc", "4.685 mAh, Sạc không dây MagSafe 25W, Sạc có dây USB-C 50% trong 30 phút", true, 9, null),
                        ("Thiết kế & Kháng nước", "Chất liệu & Kháng nước", "Khung Titan Grade 5 cao cấp, Mặt kính Ceramic Shield thế hệ mới, IP68", true, 10, null),
                        ("Kết nối", "Cổng kết nối & Mạng", "USB-C tốc độ USB 3 (lên đến 10Gb/s), 5G Sub-6GHz, Wi-Fi 7, Bluetooth 5.3", false, 11, null),
                        ("Hệ điều hành", "Hệ điều hành", "iOS 18 hỗ trợ Apple Intelligence tiếng Việt", false, 12, null),
                        ("Bảo hành", "Chính sách bảo hành", "Bảo hành 24 tháng chính hãng (12 tháng Apple + 12 tháng ShopViet Gold Care)", false, 13, null)
                    }
                ),

                // 3. Keychron Q1 Pro
                (
                    new[] { "ban-phim-co-keychron-q1-pro-qmk-via-wireless", "Keychron Q1 Pro", "Keychron" },
                    new List<(string, string, string, bool, int, string?)>
                    {
                        ("Thiết kế & Layout", "Layout bàn phím", "75% (81 phím) kèm núm xoay Rotary Encoder đa năng", true, 1, "layout"),
                        ("Thiết kế & Layout", "Chất liệu thân vỏ", "Full nhôm CNC nguyên khối 6063 Anodized cao cấp", true, 2, "material"),
                        ("Cảm giác gõ & Switch", "Cấu trúc Mounting", "Double Gasket Mount giảm chấn âm học tối đa", false, 3, null),
                        ("Cảm giác gõ & Switch", "Switch cơ học", "Keychron K Pro Mechanical (Pre-lubed Banana / Red / Brown)", true, 4, "switch"),
                        ("Cảm giác gõ & Switch", "Keycap", "KSA profile PBT Double-shot chống mòn bóng", false, 5, null),
                        ("Tính năng & Tùy biến", "Tương thích phần mềm", "Hỗ trợ tùy biến không giới hạn QMK/VIA keymap", true, 6, null),
                        ("Tính năng & Tùy biến", "Mạch Hot-swap", "Hỗ trợ Hot-swap switch 3-pin và 5-pin MX không cần hàn", false, 7, null),
                        ("Kết nối & Tương thích", "Phương thức kết nối", "Bluetooth 5.1 (kết nối tối đa 3 thiết bị) & Dây Type-C Polling Rate 1000Hz", true, 8, "connection"),
                        ("Kết nối & Tương thích", "Hệ điều hành tương thích", "macOS / Windows / Linux (kèm nút gạt chuyển đổi nhanh)", false, 9, null),
                        ("Pin & Đèn nền", "Dung lượng Pin", "4.000 mAh Li-polymer (Lên tới 300 giờ không LED, 100 giờ bật LED RGB)", true, 10, null),
                        ("Pin & Đèn nền", "Đèn nền", "South-facing RGB 22 chế độ hiệu ứng tùy biến", false, 11, null),
                        ("Bảo hành", "Chính sách bảo hành", "Bảo hành 24 tháng chính hãng Keychron Việt Nam, 1 đổi 1 trong 30 ngày", false, 12, null)
                    }
                ),

                // 4. Anker Prime 100W GaN
                (
                    new[] { "cu-sac-nhanh-anker-prime-100w-gan-3-cong", "Anker Prime 100W", "Anker" },
                    new List<(string, string, string, bool, int, string?)>
                    {
                        ("Công nghệ sạc", "Công nghệ GaN", "GaNPrime thế hệ mới - Tăng hiệu suất chuyển đổi, tản nhiệt tối ưu", true, 1, "tech"),
                        ("Công nghệ sạc", "Công suất tổng", "100W Max (Sạc đồng thời 3 thiết bị Laptop, Tablet, Smartphone)", true, 2, "wattage"),
                        ("Cổng cắm & Phân bổ", "Số lượng cổng", "3 cổng (2x USB-C + 1x USB-A)", true, 3, "ports"),
                        ("Cổng cắm & Phân bổ", "Công suất cổng đơn C1/C2", "Lên tới 100W Max (Đủ nguồn cho MacBook Pro 16 inch / Dell XPS)", true, 4, null),
                        ("Cổng cắm & Phân bổ", "Chuẩn sạc hỗ trợ", "PowerIQ 4.0, Power Delivery 3.0, PPS, Quick Charge 4.0", false, 5, null),
                        ("An toàn & Bảo vệ", "Công nghệ an toàn", "ActiveShield 2.0 kiểm soát nhiệt độ thông minh hơn 3.000.000 lần mỗi ngày", false, 6, null),
                        ("Thiết kế & Kích thước", "Kích thước & Thiết kế", "Siêu nhỏ gọn nhỏ hơn 43% so với củ sạc 96W thông thường, chân cắm gập 90 độ", false, 7, null),
                        ("Bảo hành", "Chính sách bảo hành", "Bảo hành 24 tháng đổi mới chính hãng Anker Innovations", false, 8, null)
                    }
                ),

                // 5. Cáp Ugreen 240W
                (
                    new[] { "cap-sac-nhanh-ugreen-240w-usb-c-to-usb-c", "Ugreen 240W", "Ugreen" },
                    new List<(string, string, string, bool, int, string?)>
                    {
                        ("Chuẩn sạc & Tốc độ", "Chuẩn Power Delivery", "PD 3.1 công suất siêu khủng 240W (48V / 5A Max)", true, 1, "wattage"),
                        ("Chuẩn sạc & Tốc độ", "Tốc độ truyền dữ liệu", "USB 2.0 480 Mbps truyền 1GB dữ liệu trong 30 giây", false, 2, null),
                        ("Chip điều khiển & An toàn", "Chip an toàn thông minh", "Tích hợp Chip E-Marker cao cấp nhận diện và điều chỉnh điện áp thông minh", true, 3, "chip"),
                        ("Chất liệu & Độ bền", "Chất liệu vỏ bọc", "Sợi dù bện nylon mật độ cao, chịu được hơn 10.000 lần uốn gập", true, 4, "material"),
                        ("Chất liệu & Độ bền", "Đầu cắm kết nối", "Hợp kim kẽm siêu cứng, chân tiếp xúc mạ vàng chống oxy hóa", false, 5, null),
                        ("Thông số vật lý", "Chiều dài & Trọng lượng", "Chiều dài 2m, đường kính cáp gia cường 4.5mm", false, 6, null),
                        ("Tương thích", "Thiết bị tương thích", "Tương thích ngược 140W, 100W, 65W cho MacBook, iPhone 15/16, iPad, Laptop Windows", false, 7, null),
                        ("Bảo hành", "Chính sách bảo hành", "Bảo hành 24 tháng chính hãng Ugreen 1 đổi 1", false, 8, null)
                    }
                )
            };

            foreach (var (keys, specList) in flagshipTargets)
            {
                var prod = FindProduct(keys);
                if (prod == null) continue;

                var hasKeySpecs = await _context.ProductSpecifications.AnyAsync(s => s.ProductId == prod.Id && s.IsKeySpec);
                if (!hasKeySpecs)
                {
                    var existingOld = await _context.ProductSpecifications.Where(s => s.ProductId == prod.Id).ToListAsync();
                    if (existingOld.Any())
                    {
                        _context.ProductSpecifications.RemoveRange(existingOld);
                    }

                    foreach (var spec in specList)
                    {
                        _context.ProductSpecifications.Add(new ProductSpecification
                        {
                            ProductId = prod.Id,
                            GroupName = spec.group,
                            Name = spec.name,
                            Value = spec.val,
                            IsKeySpec = spec.isKey,
                            IsHighlight = spec.isKey,
                            DisplayOrder = spec.order,
                            FilterKey = spec.filterKey
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Flagship product specifications successfully synced to SSoT 2026 standard");
        }
    }
}
