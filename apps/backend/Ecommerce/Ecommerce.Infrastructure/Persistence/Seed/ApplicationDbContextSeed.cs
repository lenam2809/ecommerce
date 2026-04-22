using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Persistence.Seed
{
    public class ApplicationDbContextSeed
    {
        private readonly ILogger<ApplicationDbContextSeed> _logger;
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<Role> _roleManager;

        public ApplicationDbContextSeed(
            ILogger<ApplicationDbContextSeed> logger,
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<Role> roleManager)
        {
            _logger = logger;
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public static async Task SeedAsync(IServiceProvider serviceProvider, bool isDevelopment = true)
        {
            using var scope = serviceProvider.CreateScope();
            var services = scope.ServiceProvider;
            var logger = services.GetRequiredService<ILogger<ApplicationDbContextSeed>>();
            var context = services.GetRequiredService<ApplicationDbContext>();
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = services.GetRequiredService<RoleManager<Role>>();

            try
            {
                logger.LogInformation("Starting database seeding");

                var seeder = new ApplicationDbContextSeed(logger, context, userManager, roleManager);
                await seeder.SeedAllAsync(isDevelopment);

                logger.LogInformation("Database seeding completed successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database");
                throw;
            }
        }

        public async Task SeedAllAsync(bool isDevelopment)
        {
            // Seed in specific order to handle dependencies
            var permissions = await SeedPermissionsAsync();
            var roles = await SeedRolesAsync();
            var users = await SeedUsersAsync(isDevelopment);

            await SeedRolePermissionsAsync(roles, permissions);
            await SeedUserRolesAsync(users, roles);

            if (isDevelopment)
            {
                // Add test data
                await SeedBrandsAsync();
                await SeedCategoriesAsync();
                await SeedProductsAsync();
                await SeedProductSpecificationsAsync();
                await SeedReviewsAsync();
                await SeedProductVariantsAsync();
                await SeedProductImagesAsync();
                await SeedBannersAsync();
            }
            await SeedAboutAndContactAsync();


            // Save all changes
            await _context.SaveChangesAsync();
        }

        private async Task<List<Permission>> SeedPermissionsAsync()
        {
            _logger.LogInformation("Seeding permissions");

            var permissions = new List<Permission>();

            if (!await _context.Permissions.AnyAsync())
            {
                // User permissions
                permissions.Add(new Permission { Name = "ViewUsers", Description = "Can view user list" });
                permissions.Add(new Permission { Name = "CreateUser", Description = "Can create new users" });
                permissions.Add(new Permission { Name = "EditUser", Description = "Can edit user details" });
                permissions.Add(new Permission { Name = "DeleteUser", Description = "Can delete users" });

                // Product permissions
                permissions.Add(new Permission { Name = "ViewProducts", Description = "Can view product list" });
                permissions.Add(new Permission { Name = "CreateProduct", Description = "Can create new products" });
                permissions.Add(new Permission { Name = "EditProduct", Description = "Can edit product details" });
                permissions.Add(new Permission { Name = "DeleteProduct", Description = "Can delete products" });

                // Category permissions
                permissions.Add(new Permission { Name = "ViewCategories", Description = "Can view category list" });
                permissions.Add(new Permission { Name = "CreateCategory", Description = "Can create new categories" });
                permissions.Add(new Permission { Name = "EditCategory", Description = "Can edit category details" });
                permissions.Add(new Permission { Name = "DeleteCategory", Description = "Can delete categories" });

                // Order permissions
                permissions.Add(new Permission { Name = "ViewOrders", Description = "Can view order list" });
                permissions.Add(new Permission { Name = "CreateOrder", Description = "Can create new orders" });
                permissions.Add(new Permission { Name = "EditOrder", Description = "Can edit order details" });
                permissions.Add(new Permission { Name = "DeleteOrder", Description = "Can delete orders" });

                // Admin permissions
                permissions.Add(new Permission { Name = "ManageRoles", Description = "Can manage roles and permissions" });
                permissions.Add(new Permission { Name = "ViewLogs", Description = "Can view system logs" });
                permissions.Add(new Permission { Name = "ManageSettings", Description = "Can manage system settings" });

                await _context.Permissions.AddRangeAsync(permissions);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Seeded {permissions.Count} permissions");
            }
            else
            {
                permissions = await _context.Permissions.ToListAsync();
                _logger.LogInformation("Permissions already exist. Skipping seeding.");
            }

            return permissions;
        }

        private async Task<List<Role>> SeedRolesAsync()
        {
            _logger.LogInformation("Seeding roles");

            var roles = new List<string> { "Admin", "Manager", "Staff", "Customer" };
            var roleEntities = new List<Role>();

            foreach (var roleName in roles)
            {
                if (!await _roleManager.RoleExistsAsync(roleName))
                {
                    var role = new Role { Name = roleName };
                    await _roleManager.CreateAsync(role);
                    roleEntities.Add(role);
                    _logger.LogInformation($"Created role: {roleName}");
                }
                else
                {
                    var existingRole = await _roleManager.FindByNameAsync(roleName);
                    if (existingRole != null)
                    {
                        roleEntities.Add(existingRole);
                    }
                }
            }

            return roleEntities;
        }

        private async Task<List<ApplicationUser>> SeedUsersAsync(bool isDevelopment)
        {
            _logger.LogInformation("Seeding users");

            var users = new List<ApplicationUser>();

            // Create admin user if it doesn't exist
            var adminEmail = "admin@Ecommerce.com";
            var adminUser = await _userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    FirstName = "System",
                    LastName = "Administrator",
                    FullName = "System Administrator",
                    Avatar = "users/avatar-20250521154845412-fd9c4c.jpg",
                    CustomerLevel = ECustomerLevel.Diamond,
                    PromotionPoints = 1000,
                    MustChangePassword = !isDevelopment
                };

                var result = await _userManager.CreateAsync(adminUser, "Admin@123456");
                if (result.Succeeded)
                {
                    _logger.LogInformation($"Created admin user: {adminEmail}");
                    users.Add(adminUser);
                }
                else
                {
                    _logger.LogError($"Failed to create admin user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }
            else
            {
                users.Add(adminUser);
            }

            if (!isDevelopment)
            {
                return users;
            }

            // Create manager user
            var managerEmail = "manager@Ecommerce.com";
            var managerUser = await _userManager.FindByEmailAsync(managerEmail);

            if (managerUser == null)
            {
                managerUser = new ApplicationUser
                {
                    UserName = managerEmail,
                    Email = managerEmail,
                    EmailConfirmed = true,
                    FirstName = "Store",
                    LastName = "Manager",
                    FullName = "Store Manager",
                    CustomerLevel = ECustomerLevel.Gold,
                    PromotionPoints = 500
                };

                var result = await _userManager.CreateAsync(managerUser, "Manager@123456");
                if (result.Succeeded)
                {
                    _logger.LogInformation($"Created manager user: {managerEmail}");
                    users.Add(managerUser);
                }
            }
            else
            {
                users.Add(managerUser);
            }

            // Create staff user
            var staffEmail = "staff@Ecommerce.com";
            var staffUser = await _userManager.FindByEmailAsync(staffEmail);

            if (staffUser == null)
            {
                staffUser = new ApplicationUser
                {
                    UserName = staffEmail,
                    Email = staffEmail,
                    EmailConfirmed = true,
                    FirstName = "Staff",
                    LastName = "Member",
                    FullName = "Staff Member",
                    CustomerLevel = ECustomerLevel.Silver,
                    PromotionPoints = 200
                };

                var result = await _userManager.CreateAsync(staffUser, "Staff@123456");
                if (result.Succeeded)
                {
                    _logger.LogInformation($"Created staff user: {staffEmail}");
                    users.Add(staffUser);
                }
            }
            else
            {
                users.Add(staffUser);
            }

            // Create regular customer user
            var customerEmail = "customer@example.com";
            var customerUser = await _userManager.FindByEmailAsync(customerEmail);

            if (customerUser == null)
            {
                customerUser = new ApplicationUser
                {
                    UserName = customerEmail,
                    Email = customerEmail,
                    EmailConfirmed = true,
                    FirstName = "Regular",
                    LastName = "Customer",
                    FullName = "Regular Customer",
                    CustomerLevel = ECustomerLevel.Bronze,
                    PromotionPoints = 50
                };

                var result = await _userManager.CreateAsync(customerUser, "Customer@123");
                if (result.Succeeded)
                {
                    _logger.LogInformation($"Created customer user: {customerEmail}");
                    users.Add(customerUser);
                }
            }
            else
            {
                users.Add(customerUser);
            }

            return users;
        }

        private async Task SeedRolePermissionsAsync(List<Role> roles, List<Permission> permissions)
        {
            _logger.LogInformation("Seeding role permissions");

            // Get role by name
            var adminRole = roles.FirstOrDefault(r => r.Name == "Admin");
            var managerRole = roles.FirstOrDefault(r => r.Name == "Manager");
            var staffRole = roles.FirstOrDefault(r => r.Name == "Staff");
            var customerRole = roles.FirstOrDefault(r => r.Name == "Customer");

            // Check if roles exist in the database
            if (adminRole != null && managerRole != null && staffRole != null && customerRole != null)
            {
                // Check if role permissions are already seeded
                if (!await _context.RolePermissions.AnyAsync())
                {
                    var rolePermissions = new List<RolePermission>();

                    // Admin has all permissions
                    foreach (var permission in permissions)
                    {
                        rolePermissions.Add(new RolePermission
                        {
                            RoleId = adminRole.Id,
                            PermissionId = permission.Id
                        });
                    }

                    // Manager permissions
                    var managerPermissions = permissions.Where(p =>
                        p.Name.StartsWith("View") ||
                        p.Name.StartsWith("Create") ||
                        p.Name.StartsWith("Edit") ||
                        p.Name == "CreateOrder" ||
                        p.Name == "EditOrder");

                    foreach (var permission in managerPermissions)
                    {
                        rolePermissions.Add(new RolePermission
                        {
                            RoleId = managerRole.Id,
                            PermissionId = permission.Id
                        });
                    }

                    // Staff permissions
                    var staffPermissions = permissions.Where(p =>
                        p.Name.StartsWith("View") ||
                        p.Name == "CreateProduct" ||
                        p.Name == "EditProduct" ||
                        p.Name == "CreateOrder" ||
                        p.Name == "EditOrder");

                    foreach (var permission in staffPermissions)
                    {
                        rolePermissions.Add(new RolePermission
                        {
                            RoleId = staffRole.Id,
                            PermissionId = permission.Id
                        });
                    }

                    // Customer permissions
                    var customerPermissions = permissions.Where(p =>
                        p.Name == "ViewProducts" ||
                        p.Name == "ViewCategories" ||
                        p.Name == "CreateOrder");

                    foreach (var permission in customerPermissions)
                    {
                        rolePermissions.Add(new RolePermission
                        {
                            RoleId = customerRole.Id,
                            PermissionId = permission.Id
                        });
                    }

                    await _context.RolePermissions.AddRangeAsync(rolePermissions);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"Seeded {rolePermissions.Count} role permissions");
                }
                else
                {
                    _logger.LogInformation("Role permissions already exist. Skipping seeding.");
                }
            }
        }

        private async Task SeedUserRolesAsync(List<ApplicationUser> users, List<Role> roles)
        {
            _logger.LogInformation("Seeding user roles");

            // Assign roles to users
            var adminUser = users.FirstOrDefault(u => u.Email == "admin@Ecommerce.com");
            var managerUser = users.FirstOrDefault(u => u.Email == "manager@Ecommerce.com");
            var staffUser = users.FirstOrDefault(u => u.Email == "staff@Ecommerce.com");
            var customerUser = users.FirstOrDefault(u => u.Email == "customer@example.com");

            // Get roles
            var adminRole = roles.FirstOrDefault(r => r.Name == "Admin");
            var managerRole = roles.FirstOrDefault(r => r.Name == "Manager");
            var staffRole = roles.FirstOrDefault(r => r.Name == "Staff");
            var customerRole = roles.FirstOrDefault(r => r.Name == "Customer");

            // Assign roles if they exist
            if (adminUser != null && adminRole != null)
            {
                if (!await _userManager.IsInRoleAsync(adminUser, adminRole.Name!))
                {
                    await _userManager.AddToRoleAsync(adminUser, adminRole.Name!);
                    _logger.LogInformation($"Assigned {adminRole.Name} role to {adminUser.Email}");
                }
            }

            if (managerUser != null && managerRole != null)
            {
                if (!await _userManager.IsInRoleAsync(managerUser, managerRole.Name!))
                {
                    await _userManager.AddToRoleAsync(managerUser, managerRole.Name!);
                    _logger.LogInformation($"Assigned {managerRole.Name} role to {managerUser.Email}");
                }
            }

            if (staffUser != null && staffRole != null)
            {
                if (!await _userManager.IsInRoleAsync(staffUser, staffRole.Name!))
                {
                    await _userManager.AddToRoleAsync(staffUser, staffRole.Name!);
                    _logger.LogInformation($"Assigned {staffRole.Name} role to {staffUser.Email}");
                }
            }

            if (customerUser != null && customerRole != null)
            {
                if (!await _userManager.IsInRoleAsync(customerUser, customerRole.Name!))
                {
                    await _userManager.AddToRoleAsync(customerUser, customerRole.Name!);
                    _logger.LogInformation($"Assigned {customerRole.Name} role to {customerUser.Email}");
                }
            }
        }

        private async Task SeedBrandsAsync()
        {
            _logger.LogInformation("Seeding brands");

            if (!await _context.Brands.AnyAsync())
            {
                var brands = new List<Brand>
                {
                    new Brand
                    {
                        Code = "Apple",
                        Name = "Apple",
                        Description = "Nhà sản xuất điện thoại và máy tính hàng đầu thế giới",
                        Slug = "apple",
                        LogoUrl = "brands/Apple_iPhone_15_Pro_256GB.png"
                    },
                    new Brand
                    {
                        Code = "HONOR",
                        Name = "HONOR",
                        Description = "Thương hiệu điện thoại thông minh của Trung Quốc",
                        Slug = "honor",
                        LogoUrl = "brands/Apple_iPhone_15_Pro_256GB.png"
                    },
                    new Brand
                    {
                        Code = "Other",
                        Name = "Hãng Khác",
                        Description = "Các thương hiệu điện thoại khác",
                        Slug = "hang-khac",
                        LogoUrl = "brands/Apple_iPhone_15_Pro_256GB.png"
                    },
                    new Brand
                    {
                        Code = "OPPO",
                        Name = "OPPO",
                        Description = "Thương hiệu điện thoại thông minh nổi tiếng châu Á",
                        Slug = "oppo",
                        LogoUrl = "brands/Apple_iPhone_15_Pro_256GB.png"
                    },
                    new Brand
                    {
                        Code = "Samsung",
                        Name = "Samsung",
                        Description = "Thương hiệu điện tử hàng đầu Hàn Quốc",
                        Slug = "samsung",
                        LogoUrl = "brands/Apple_iPhone_15_Pro_256GB.png"
                    },
                    new Brand
                    {
                        Code = "Xiaomi",
                        Name = "Xiaomi",
                        Description = "Thương hiệu điện thoại Trung Quốc nổi tiếng",
                        Slug = "xiaomi",
                        LogoUrl = "brands/Apple_iPhone_15_Pro_256GB.png"
                    },
                };

                await _context.Brands.AddRangeAsync(brands);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Seeded {brands.Count} brands");
            }
            else
            {
                _logger.LogInformation("Brands already exist. Skipping seeding.");
            }
        }

        private async Task SeedCategoriesAsync()
        {
            _logger.LogInformation("Seeding categories");

            if (!await _context.Categories.AnyAsync())
            {
                var categories = new List<Category>
                {
                    new Category
                    {
                        Code = "DTDĐ",
                        Name = "Điện Thoại Di Động",
                        Description = "Các dòng điện thoại thông minh hiện đại",
                        Slug = "dien-thoai-di-dong",
                        Image = "categories/apple_iphone_15_pro_256gb-20260323120346722-93fe9b.jpg"
                    },
                    new Category
                    {
                        Code = "Laptop",
                        Name = "Laptop",
                        Description = "Máy tính xách tay và máy tính di động",
                        Slug = "laptop",
                        Image = "categories/apple_iphone_15_pro_256gb-20260323120346722-93fe9b.jpg"
                    },
                    new Category
                    {
                        Code = "MTB",
                        Name = "Máy Tính Bảng",
                        Description = "Thiết bị máy tính di động màn hình lớn",
                        Slug = "may-tinh-bang",
                        Image = "categories/apple_iphone_15_pro_256gb-20260323120346722-93fe9b.jpg"
                    },
                    new Category
                    {
                        Code = "PKCN",
                        Name = "Phụ Kiện Công Nghệ",
                        Description = "Phụ kiện điện tử và công nghệ",
                        Slug = "phu-kien-cong-nghe",
                        Image = "categories/apple_iphone_15_pro_256gb-20260323120346722-93fe9b.jpg"
                    },
                    new Category
                    {
                        Code = "MS",
                        Name = "Âm Thanh",
                        Description = "Tai nghe, loa và thiết bị âm thanh",
                        Slug = "am-thanh",
                        Image = "categories/apple_iphone_15_pro_256gb-20260323120346722-93fe9b.jpg"
                    }
                };

                await _context.Categories.AddRangeAsync(categories);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Seeded {categories.Count} categories");
            }
            else
            {
                _logger.LogInformation("Categories already exist. Skipping seeding.");
            }
        }

        private async Task SeedProductsAsync()
        {
            _logger.LogInformation("Seeding products");

            if (!await _context.Products.AnyAsync())
            {
                var categories = await _context.Categories.ToListAsync();
                var brands = await _context.Brands.ToListAsync();

                var catPhone = categories.FirstOrDefault(c => c.Code == "DTDĐ");

                if (catPhone == null)
                {
                    _logger.LogWarning("Category DTDĐ not found. Skipping product seeding.");
                    return;
                }

                var products = new List<Product>();

                {
                    var brand_honor_x9d_12gb_512gb = brands.FirstOrDefault(b => b.Code == "HONOR");
                    if (brand_honor_x9d_12gb_512gb != null)
                    {
                        var p = Product.Create(
                            "HONOR-X9D-12GB-512GB",
                            "HONOR X9d 12GB 512GB",
                            "honor-x9d-12gb-512gb",
                            "HONOR-X9D-12GB-512GB",
                            10990000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "Điện thoại Honor X9d chính hãng giá rẻ - Thu cũ đổi mới trợ giá 1tr. Tặng Honor Ultimate Care bảo hành 24 tháng, đổi mới 100 ngày, trả góp 0%.",
                            100,
                            catPhone.Id,
                            brand_honor_x9d_12gb_512gb.Id
                        );
                        p.UpdateRating(5.0, 3);
                        products.Add(p);
                    }
                }

                {
                    var brand_xiaomi_poco_f8_pro_5g_12gb_256gb = brands.FirstOrDefault(b => b.Code == "Xiaomi");
                    if (brand_xiaomi_poco_f8_pro_5g_12gb_256gb != null)
                    {
                        var p = Product.Create(
                            "POCO-F8-PRO-12-256",
                            "Xiaomi POCO F8 Pro 5G 12GB 256GB",
                            "xiaomi-poco-f8-pro-5g-12gb-256gb",
                            "XIAOMI-POCO-F8-PRO-5G-12GB-256GB",
                            14490000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "Poco F8 Pro 5G có màn 6.59inch, pin 6.210mAh, camera sau 50MP. Mua ngay điện thoại Xiaomi Poco F8 Pro ưu đãi T03/2026 tại CellphoneS.",
                            100,
                            catPhone.Id,
                            brand_xiaomi_poco_f8_pro_5g_12gb_256gb.Id
                        );
                        p.UpdateRating(5.0, 7);
                        products.Add(p);
                    }
                }

                {
                    var brand_honor_magic_v5_16gb_512gb = brands.FirstOrDefault(b => b.Code == "HONOR");
                    if (brand_honor_magic_v5_16gb_512gb != null)
                    {
                        var p = Product.Create(
                            "HONOR-MAGIC-V5-512",
                            "HONOR Magic V5 16GB 512GB",
                            "honor-magic-v5-16gb-512gb",
                            "HONOR-MAGIC-V5-16GB-512GB",
                            39490000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "Điện thoại gập HONOR Magic V5 cao cấp, đặt sớm nhận sớm, tặng bộ quà 12tr, bảo hành 24 tháng. Thu cũ đổi mới giá tốt nhất thị trường. Giao miễn phí.",
                            100,
                            catPhone.Id,
                            brand_honor_magic_v5_16gb_512gb.Id
                        );
                        p.UpdateRating(5.0, 1);
                        products.Add(p);
                    }
                }

                {
                    var brand_nothing_phone_2a_plus_5g_12gb_256gb = brands.FirstOrDefault(b => b.Code == "Other");
                    if (brand_nothing_phone_2a_plus_5g_12gb_256gb != null)
                    {
                        var p = Product.Create(
                            "NOTHING-2A-PLUS-256",
                            "Nothing Phone 2A Plus 5G 12GB 256GB",
                            "nothing-phone-2a-plus-5g-12gb-256gb",
                            "NOTHING-PHONE-2A-PLUS-5G-12GB-256GB",
                            7490000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "Điện thoại Nothing Phone 2A Plus chính hãng, BH 12 tháng, lỗi 1 đổi 1 trong 3 tháng, trả góp 0%. Mua ngay Nothing Phone 2A Plus giao hàng nhanh.",
                            100,
                            catPhone.Id,
                            brand_nothing_phone_2a_plus_5g_12gb_256gb.Id
                        );
                        p.UpdateRating(4.8, 6);
                        products.Add(p);
                    }
                }

                {
                    var brand_tecno_pova_7_8gb_128gb = brands.FirstOrDefault(b => b.Code == "Other");
                    if (brand_tecno_pova_7_8gb_128gb != null)
                    {
                        var p = Product.Create(
                            "TECNO-POVA7-128",
                            "Tecno Pova 7 8GB 128GB",
                            "tecno-pova-7-8gb-128gb",
                            "TECNO-POVA-7-8GB-128GB",
                            4390000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "Điện thoại Tecno Pova 7 chính hãng giá rẻ, giảm thẳng 500.000đ, thu cũ đổi mới, bảo hành 12 tháng, đổi mới 30 ngày, trả góp 0%. Mua ngay Pova 7 tại đây.",
                            100,
                            catPhone.Id,
                            brand_tecno_pova_7_8gb_128gb.Id
                        );
                        p.UpdateRating(4.6, 9);
                        products.Add(p);
                    }
                }

                {
                    var brand_tecno_pova_7_8gb_256gb = brands.FirstOrDefault(b => b.Code == "Other");
                    if (brand_tecno_pova_7_8gb_256gb != null)
                    {
                        var p = Product.Create(
                            "TECNO-POVA7-256",
                            "Tecno Pova 7 8GB 256GB",
                            "tecno-pova-7-8gb-256gb",
                            "TECNO-POVA-7-8GB-256GB",
                            4890000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "Mua TECNO POVA 7 8GB 256GB giá rẻ - Hỗ trợ trả góp 0%, đổi mới 30 ngày, bảo hành chính hãng, giao hàng tận nơi miễn phí.",
                            100,
                            catPhone.Id,
                            brand_tecno_pova_7_8gb_256gb.Id
                        );
                        p.UpdateRating(4.7, 7);
                        products.Add(p);
                    }
                }

                {
                    var brand_iphone_17_pro_256gb_chinh_hang = brands.FirstOrDefault(b => b.Code == "Apple");
                    if (brand_iphone_17_pro_256gb_chinh_hang != null)
                    {
                        var p = Product.Create(
                            "IP17-PRO-256-CHNH",
                            "iPhone 17 Pro 256GB | Chính hãng",
                            "iphone-17-pro-256gb-chinh-hang",
                            "IPHONE-17-PRO-256GB---CH-NH-H-NG",
                            34490000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "iPhone 17 Pro (256GB, 512GB, 1TB) giá tốt, chip A19 Pro, màu cam đẹp. thu cũ trợ giá giảm đến 7,5 triệu, trả góp 0% 12 tháng - Mua ip17pro ngay!",
                            100,
                            catPhone.Id,
                            brand_iphone_17_pro_256gb_chinh_hang.Id
                        );
                        p.UpdateRating(5.0, 27);
                        products.Add(p);
                    }
                }

                {
                    var brand_samsung_galaxy_s26_ultra_12gb_256gb = brands.FirstOrDefault(b => b.Code == "Samsung");
                    if (brand_samsung_galaxy_s26_ultra_12gb_256gb != null)
                    {
                        var p = Product.Create(
                            "SS-S26U-12-256",
                            "Samsung Galaxy S26 Ultra 12GB 256GB",
                            "samsung-galaxy-s26-ultra-12gb-256gb",
                            "SAMSUNG-GALAXY-S26-ULTRA-12GB-256GB",
                            33490000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "Samsung Galaxy S26 Ultra 12GB/256GB giảm đến 8 triệu, thu cũ trợ giá 5 triệu, trả góp 0% lãi suất, giao toàn quốc. Xem thêm giá S26 Ultra tại đây.",
                            100,
                            catPhone.Id,
                            brand_samsung_galaxy_s26_ultra_12gb_256gb.Id
                        );
                        p.UpdateRating(5.0, 7);
                        products.Add(p);
                    }
                }

                {
                    var brand_iphone_17_pro_max_256gb_chinh_hang = brands.FirstOrDefault(b => b.Code == "Apple");
                    if (brand_iphone_17_pro_max_256gb_chinh_hang != null)
                    {
                        var p = Product.Create(
                            "IP17-PROMAX-256-CHNH",
                            "iPhone 17 Pro Max 256GB | Chính hãng",
                            "iphone-17-pro-max-256gb-chinh-hang",
                            "IPHONE-17-PRO-MAX-256GB---CH-NH-H-NG",
                            37790000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "Giá iPhone 17 Pro Max (256GB, 512GB, 1TB, 2TB) khởi điểm từ 34 triệu. trả góp 0%, mua trước thu máy cũ sau - Mua Apple ip17 promax tại CellphoneS",
                            100,
                            catPhone.Id,
                            brand_iphone_17_pro_max_256gb_chinh_hang.Id
                        );
                        p.UpdateRating(5.0, 16);
                        products.Add(p);
                    }
                }

                {
                    var brand_iphone_17_256gb_chinh_hang = brands.FirstOrDefault(b => b.Code == "Apple");
                    if (brand_iphone_17_256gb_chinh_hang != null)
                    {
                        var p = Product.Create(
                            "IP17-256-CHNH",
                            "iPhone 17 256GB | Chính hãng",
                            "iphone-17-256gb-chinh-hang",
                            "IPHONE-17-256GB---CH-NH-H-NG",
                            24790000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "iPhone 17 thường 256GB - Số 1 thu cũ, ưu đãi 5 triệu, thanh toán ngân hàng giảm 2 triệu - Mua iPhone 17 256gb giá tốt ngay",
                            100,
                            catPhone.Id,
                            brand_iphone_17_256gb_chinh_hang.Id
                        );
                        p.UpdateRating(5.0, 7);
                        products.Add(p);
                    }
                }

                {
                    var brand_samsung_galaxy_s25_ultra_12gb_256gb = brands.FirstOrDefault(b => b.Code == "Samsung");
                    if (brand_samsung_galaxy_s25_ultra_12gb_256gb != null)
                    {
                        var p = Product.Create(
                            "SS-S25U-12-256",
                            "Samsung Galaxy S25 Ultra 12GB 256GB",
                            "samsung-galaxy-s25-ultra-12gb-256gb",
                            "SAMSUNG-GALAXY-S25-ULTRA-12GB-256GB",
                            26990000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "Samsung S25 Ultra giảm giá sốc 5 triệu, chip Snapdragon 8 Elite For Galaxy mạnh, chính hãng, camera sắc nét. Mua ngay S25 Ultra 5G tại đây.",
                            100,
                            catPhone.Id,
                            brand_samsung_galaxy_s25_ultra_12gb_256gb.Id
                        );
                        p.UpdateRating(4.7, 43);
                        products.Add(p);
                    }
                }

                {
                    var brand_iphone_air_256gb_chinh_hang = brands.FirstOrDefault(b => b.Code == "Apple");
                    if (brand_iphone_air_256gb_chinh_hang != null)
                    {
                        var p = Product.Create(
                            "IP-AIR-256-CHNH",
                            "iPhone Air 256GB | Chính hãng",
                            "iphone-air-256gb-chinh-hang",
                            "IPHONE-AIR-256GB---CH-NH-H-NG",
                            24990000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "iPhone Air 256GB chính hãng, giá giảm đến 7 triệu, nhiều màu, sẵn hàng tại Việt Nam. Mua ngay tại CellphoneS, trả góp 0% lãi đến 12 tháng",
                            100,
                            catPhone.Id,
                            brand_iphone_air_256gb_chinh_hang.Id
                        );
                        p.UpdateRating(4.9, 9);
                        products.Add(p);
                    }
                }

                {
                    var brand_oppo_reno15_f_5g_8gb_256gb = brands.FirstOrDefault(b => b.Code == "OPPO");
                    if (brand_oppo_reno15_f_5g_8gb_256gb != null)
                    {
                        var p = Product.Create(
                            "OPPO-RENO15F-8-256",
                            "OPPO Reno15 F 5G 8GB 256GB",
                            "oppo-reno15-f-5g-8gb-256gb",
                            "OPPO-RENO15-F-5G-8GB-256GB",
                            11490000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "OPPO Reno15 F 5G màn hình 6.57 inch, pin 7000mAh. Giá 11.990.000đ, trả góp 0%, quà 4 triệu, thu cũ trợ giá 2 triệu. Mua ngay tại CellphoneS!",
                            100,
                            catPhone.Id,
                            brand_oppo_reno15_f_5g_8gb_256gb.Id
                        );
                        products.Add(p);
                    }
                }

                {
                    var brand_iphone_15_128gb_chinh_hang_vna = brands.FirstOrDefault(b => b.Code == "Apple");
                    if (brand_iphone_15_128gb_chinh_hang_vna != null)
                    {
                        var p = Product.Create(
                            "IP15-128-CHNH-VNA",
                            "iPhone 15 128GB | Chính hãng VN/A",
                            "iphone-15-128gb-chinh-hang-vna",
                            "IPHONE-15-128GB---CH-NH-H-NG-VN-A",
                            17990000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "Mua iPhone 15 thường 128GB chính hãng VN/A - giá rẻ giảm sâu tháng 03/2026, trợ giá thu cũ lên đời 4 triệu, sẵn hàng đủ màu, trả góp 0% không trả trước.",
                            100,
                            catPhone.Id,
                            brand_iphone_15_128gb_chinh_hang_vna.Id
                        );
                        p.UpdateRating(4.9, 99);
                        products.Add(p);
                    }
                }

                {
                    var brand_samsung_galaxy_s26_12gb_256gb = brands.FirstOrDefault(b => b.Code == "Samsung");
                    if (brand_samsung_galaxy_s26_12gb_256gb != null)
                    {
                        var p = Product.Create(
                            "SS-S26-12-256",
                            "Samsung Galaxy S26 12GB 256GB",
                            "samsung-galaxy-s26-12gb-256gb",
                            "SAMSUNG-GALAXY-S26-12GB-256GB",
                            22490000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "Mua Samsung Galaxy S26 12GB 256GB chính hãng giá rẻ - Thu cũ đổi mới, bảo hành 12 tháng, đổi mới 30 ngày, trả góp 0%. Mua ngay Samsung Galaxy S26 12GB 256GB tại đây.",
                            100,
                            catPhone.Id,
                            brand_samsung_galaxy_s26_12gb_256gb.Id
                        );
                        products.Add(p);
                    }
                }

                {
                    var brand_dien_thoai_iphone_16_pro_max_256gb = brands.FirstOrDefault(b => b.Code == "Apple");
                    if (brand_dien_thoai_iphone_16_pro_max_256gb != null)
                    {
                        var p = Product.Create(
                            "IP16-PROMAX-256",
                            "Điện thoại iPhone 16 Pro Max 256GB",
                            "dien-thoai-iphone-16-pro-max-256gb",
                            "I-N-THO-I-IPHONE-16-PRO-MAX-256GB",
                            31590000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "Giá iPhone 16 Pro Max mới, ưu đãi trả góp 0%, trả trước 0 đồng, giảm đến 7,5 triệu, trợ giá lên đời 3 triệu - Mua Apple iPhone 16 Pro Max ngay",
                            100,
                            catPhone.Id,
                            brand_dien_thoai_iphone_16_pro_max_256gb.Id
                        );
                        p.UpdateRating(4.9, 365);
                        products.Add(p);
                    }
                }

                {
                    var brand_oppo_reno15_5g_12gb_256gb = brands.FirstOrDefault(b => b.Code == "OPPO");
                    if (brand_oppo_reno15_5g_12gb_256gb != null)
                    {
                        var p = Product.Create(
                            "OPPO-RENO15-12-256",
                            "OPPO Reno15 5G 12GB 256GB",
                            "oppo-reno15-5g-12gb-256gb",
                            "OPPO-RENO15-5G-12GB-256GB",
                            16490000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "OPPO Reno15 5G 12GB/256GB màn hình 6.59&quot;, chip Dimensity 8450, pin 6200mAh. Giá 16.990.000đ, trả góp 0%, quà 4 triệu, tặng loa. Mua ngay!",
                            100,
                            catPhone.Id,
                            brand_oppo_reno15_5g_12gb_256gb.Id
                        );
                        products.Add(p);
                    }
                }

                {
                    var brand_honor_x8d_8gb_128gb = brands.FirstOrDefault(b => b.Code == "HONOR");
                    if (brand_honor_x8d_8gb_128gb != null)
                    {
                        var p = Product.Create(
                            "HONOR-X8D-8-128",
                            "HONOR X8d 8GB 128GB",
                            "honor-x8d-8gb-128gb",
                            "HONOR-X8D-8GB-128GB",
                            7790000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "HONOR X8d 8GB 128GB màn hình 6.77&quot;, mỏng nhẹ 7.5mm, pin 7.000 mAh. Giá 7.79 triệu, góp 0%, trợ giá thu cũ 1 triệu. Mua ngay tại CellphoneS!",
                            100,
                            catPhone.Id,
                            brand_honor_x8d_8gb_128gb.Id
                        );
                        products.Add(p);
                    }
                }

                {
                    var brand_samsung_galaxy_z_fold7_12gb_256gb = brands.FirstOrDefault(b => b.Code == "Samsung");
                    if (brand_samsung_galaxy_z_fold7_12gb_256gb != null)
                    {
                        var p = Product.Create(
                            "SS-ZFOLD7-12-256",
                            "Samsung Galaxy Z Fold7 12GB 256GB",
                            "samsung-galaxy-z-fold7-12gb-256gb",
                            "SAMSUNG-GALAXY-Z-FOLD7-12GB-256GB",
                            41490000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "Samsung Galaxy Z Fold 7 5G 12GB 256GB giá tốt hôm nay tại TPHCM và Hà Nội, bảo hành 24 tháng, trợ giá lên đời 2 triệu, trả góp 0%, giao nhanh.",
                            100,
                            catPhone.Id,
                            brand_samsung_galaxy_z_fold7_12gb_256gb.Id
                        );
                        p.UpdateRating(5.0, 119);
                        products.Add(p);
                    }
                }

                {
                    var brand_samsung_galaxy_z_flip7_12gb_256gb = brands.FirstOrDefault(b => b.Code == "Samsung");
                    if (brand_samsung_galaxy_z_flip7_12gb_256gb != null)
                    {
                        var p = Product.Create(
                            "SS-ZFLIP7-12-256",
                            "Samsung Galaxy Z Flip7 12GB 256GB",
                            "samsung-galaxy-z-flip7-12gb-256gb",
                            "SAMSUNG-GALAXY-Z-FLIP7-12GB-256GB",
                            23490000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "Samsung Galaxy Z Flip 7 giá tốt 03/2026, ưu đãi đến 11Tr890K, thu cũ trợ giá cao, tặng sim 5G, bảo hành 12 tháng - sẵn hàng giao nhanh.",
                            100,
                            catPhone.Id,
                            brand_samsung_galaxy_z_flip7_12gb_256gb.Id
                        );
                        p.UpdateRating(5.0, 45);
                        products.Add(p);
                    }
                }

                {
                    var brand_samsung_galaxy_s26_ultra_12gb_512gb = brands.FirstOrDefault(b => b.Code == "Samsung");
                    if (brand_samsung_galaxy_s26_ultra_12gb_512gb != null)
                    {
                        var p = Product.Create(
                            "SS-S26U-12-512",
                            "Samsung Galaxy S26 Ultra 12GB 512GB",
                            "samsung-galaxy-s26-ultra-12gb-512gb",
                            "SAMSUNG-GALAXY-S26-ULTRA-12GB-512GB",
                            38490000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "Mua Samsung Galaxy S26 Ultra 512GB chính hãng giá rẻ - Giảm đến 16,5 triệu, Trợ giá lên đời tặng BHMR 12 tháng, Sim data. Mua S26 Ultra 512GB tại đây.",
                            100,
                            catPhone.Id,
                            brand_samsung_galaxy_s26_ultra_12gb_512gb.Id
                        );
                        p.UpdateRating(5.0, 1);
                        products.Add(p);
                    }
                }

                {
                    var brand_iphone_17e_256gb_chinh_hang = brands.FirstOrDefault(b => b.Code == "Apple");
                    if (brand_iphone_17e_256gb_chinh_hang != null)
                    {
                        var p = Product.Create(
                            "IP17E-256-CHNH",
                            "iPhone 17e 256GB | Chính hãng",
                            "iphone-17e-256gb-chinh-hang",
                            "IPHONE-17E-256GB---CH-NH-H-NG",
                            17990000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "iPhone 17e (256GB, 512GB) giá tốt, giá chỉ từ 17,99 triệu, màn hình 6.1 inch, chính hãng, thu cũ trợ giá 3tr trả góp 0% 12 tháng tại CellphoneS",
                            100,
                            catPhone.Id,
                            brand_iphone_17e_256gb_chinh_hang.Id
                        );
                        products.Add(p);
                    }
                }

                {
                    var brand_xiaomi_redmi_note_14_pro_plus_5g_8gb_256gb = brands.FirstOrDefault(b => b.Code == "Xiaomi");
                    if (brand_xiaomi_redmi_note_14_pro_plus_5g_8gb_256gb != null)
                    {
                        var p = Product.Create(
                            "REDMI-N14PP-256",
                            "Xiaomi Redmi Note 14 Pro Plus 5G 8GB 256GB",
                            "xiaomi-redmi-note-14-pro-plus-5g-8gb-256gb",
                            "XIAOMI-REDMI-NOTE-14-PRO-PLUS-5G-8GB-256",
                            7990000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "Xiaomi Redmi Note 14 Pro Plus giá rẻ nhất, giảm 3,59TR, pin 6200mAh lớn, chính hãng, sẵn hàng - Mua Redmi note 14 Pro | Pro+ 5G ngay",
                            100,
                            catPhone.Id,
                            brand_xiaomi_redmi_note_14_pro_plus_5g_8gb_256gb.Id
                        );
                        p.UpdateRating(5.0, 84);
                        products.Add(p);
                    }
                }

                {
                    var brand_iphone_16e_128gb_chinh_hang_vna = brands.FirstOrDefault(b => b.Code == "Apple");
                    if (brand_iphone_16e_128gb_chinh_hang_vna != null)
                    {
                        var p = Product.Create(
                            "IP16E-128-CHNH-VNA",
                            "iPhone 16e 128GB | Chính hãng VN/A",
                            "iphone-16e-128gb-chinh-hang-vna",
                            "IPHONE-16E-128GB---CH-NH-H-NG-VN-A",
                            12490000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "Giá ip 16e 2025 giảm sâu 3,5 triệu, chính hãng Apple VN/A chip A18 tích hợp AI, trả góp 0% lãi suất - Mua iphone 16 e tại CellphoneS ngay!",
                            100,
                            catPhone.Id,
                            brand_iphone_16e_128gb_chinh_hang_vna.Id
                        );
                        p.UpdateRating(4.9, 44);
                        products.Add(p);
                    }
                }

                {
                    var brand_samsung_galaxy_a07_4gb_128gb = brands.FirstOrDefault(b => b.Code == "Samsung");
                    if (brand_samsung_galaxy_a07_4gb_128gb != null)
                    {
                        var p = Product.Create(
                            "SS-A07-4-128",
                            "Samsung Galaxy A07 4GB 128GB",
                            "samsung-galaxy-a07-4gb-128gb",
                            "SAMSUNG-GALAXY-A07-4GB-128GB",
                            3190000,
                            null,
                            "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg",
                            "Mua điện thoại Samsung Galaxy A07 $GB 128GB giá tốt, trợ giá thu cũ, trả góp 0%, bảo hành chính hãng, giảm thêm Smember. Mua Galaxy A07 ngay.",
                            100,
                            catPhone.Id,
                            brand_samsung_galaxy_a07_4gb_128gb.Id
                        );
                        p.UpdateRating(5.0, 3);
                        products.Add(p);
                    }
                }

                await _context.Products.AddRangeAsync(products);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Seeded {products.Count} products");
            }
            else
            {
                _logger.LogInformation("Products already exist. Skipping seeding.");
            }
        }

        private async Task SeedProductSpecificationsAsync()
        {
            _logger.LogInformation("Seeding product specifications...");

            if (!await _context.ProductSpecifications.AnyAsync())
            {
                var products = await _context.Products.ToListAsync();
                var allSpecs = new List<ProductSpecification>();

                // HONOR X9d 12GB 512GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "honor-x9d-12gb-512gb");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.79 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "AMOLED" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "Camera chính 108MP (F1.75) + Camera góc rộng 5MP (F2.2)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "16MP (F2.45)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Snapdragon 6 Gen 4" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "12 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "512 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "8300 mAh" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "2 Nano-SIM" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "MagicOS 9.0 (Dựa trên Android 15）" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "1200 x 2640 pixels" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "100% DCI-P3" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "8 nhân (1× A720 2.3GHz + 3× A720 2.2GHz + 4× A520 1.8GHz)" });
                    }
                }

                // Xiaomi POCO F8 Pro 5G 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "xiaomi-poco-f8-pro-5g-12gb-256gb");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.59 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "AMOLED" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "50MP chính (Light Fusion 800" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "20MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Snapdragon® 8 Elite" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "12 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "256 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "6210mAh" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "2 Nano SIM hoặc 2 eSIM hoặc 1 Nano SIM + 1 eSIM" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "Xiaomi HyperOS 3" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "2510 x 1156 pixels" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Độ sáng tối đa 3500 nits Tỷ lệ tương phản 5.000.000:1 Độ sáng HBM 2000 nits 68 tỷ màu | Dải màu rộng DCI-P3 Cảm ứng kháng nước 2.0 Chứng nhận TUV (ánh sáng xanh thấp" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "8 nhân" });
                    }
                }

                // HONOR Magic V5 16GB 512GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "honor-magic-v5-16gb-512gb");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.43 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "OLED" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "Camera góc siêu rộng 50MP (khẩu độ f/2.0) Camera góc rộng 50MP (khẩu độ f/1.6" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "Màn hình trong: Camera góc rộng 20MP (f/2.2) Màn hình ngoài: Camera góc rộng 20MP (f/2.2)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Qualcomm Snapdragon 8 Elite" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "16 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "512 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "5820 mAh" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "SIM 1 + SIM 2 / SIM 1 + eSIM / 2 eSIM" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "MagicOS 9.0.1 (Dựa trên Android 15)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Màn hình trong: 2352 x 2172 pixel Màn hình ngoài: 2376 x 1060 pixel 1" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "Tám nhân (2×Prime 4" });
                    }
                }

                // Nothing Phone 2A Plus 5G 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "nothing-phone-2a-plus-5g-12gb-256gb");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.7 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "Flexible AMOLED On-cell" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "Camera chính: 50 MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "1/1.57\" Camera góc siêu rộng", Value = "50 MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "50 MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "MediaTek Dimensity 7350 Pro 5G" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "12 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "256 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "5000 mAh" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "2 SIM (Nano-SIM)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "Android 14" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "1080 x 2412 pixels" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "1300 nits 120 Hz" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "Up to 3.0 GHz" });
                    }
                }

                // Tecno Pova 7 8GB 128GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "tecno-pova-7-8gb-128gb");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.78 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "IPS LCD" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "108M+2M" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "8MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "MediaTek Helio G100 Utimate" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "8 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "128 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "7000mAh" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "2 Nano-SIM" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "Android 15" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "1080x2460 pixels" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Tần số quét 120Hz" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "2*A76 up to 2.2Ghz" });
                    }
                }

                // Tecno Pova 7 8GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "tecno-pova-7-8gb-256gb");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.78 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "IPS LCD" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "108M+2M" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "8MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "MediaTek Helio G100 Utimate" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "8 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "256 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "7000mAh" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "2 Nano-SIM" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "Android 15" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "1080x2460 pixels" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Tần số quét 120Hz" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "2*A76 up to 2.2Ghz" });
                    }
                }

                // iPhone 17 Pro 256GB | Chính hãng
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-17-pro-256gb-chinh-hang");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.3 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "Super Retina XDR" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "Chính: 48MP khẩu độ ƒ/1.6 OIS hỗ trợ chụp 24MP hoặc 48MP Góc Siêu Rộng: 48MP khẩu độ ƒ/2.2 góc nhìn 120° Telephoto: 48MP khẩu độ ƒ/2.8 OIS zoom quang học lên đến 8x" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "Camera 18MP Center Stage Khẩu độ ƒ/1.9" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Chip A19 Pro" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "256 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "Sim kép (nano-Sim và e-Sim) - Hỗ trợ 2 e-Sim" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "iOS 26" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "2622 x 1206  pixels" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Màn hình Luôn Bật" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tỷ lệ tương phản 2.000.000", Value = "1" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện" });
                    }
                }

                // Samsung Galaxy S26 Ultra 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-s26-ultra-12gb-256gb");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.9 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "Dynamic AMOLED 2X" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "Camera siêu rộng: 50MP Camera góc rộng: 200MP Camera Tele (5x): 50MP Camera Tele (3x): 10MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "12MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Snapdragon 8 Elite Gen 5 dành cho Galaxy (3nm)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "12 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "256 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "5000 mAh" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "2 Nano-SIM + eSIM" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "3120 x 1440 pixels (Quad HD+)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Tần số quét: 1-120Hz Độ sáng tối đa: 2600 nits" });
                    }
                }

                // iPhone 17 Pro Max 256GB | Chính hãng
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-17-pro-max-256gb-chinh-hang");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.9 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "Super Retina XDR" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "Chính: 48MP khẩu độ ƒ/1.6 OIS hỗ trợ chụp 24MP hoặc 48MP Góc Siêu Rộng: 48MP khẩu độ ƒ/2.2 góc nhìn 120° Telephoto: 48MP khẩu độ ƒ/2.8 OIS zoom quang học lên đến 8x" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "Camera 18MP Center Stage Khẩu độ ƒ/1.9" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Chip A19 Pro" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "256 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "Sim kép (nano-Sim và e-Sim) - Hỗ trợ 2 e-Sim" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "iOS 26" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "2868 x 1320 pixels" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Màn hình Luôn Bật" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tỷ lệ tương phản 2.000.000", Value = "1" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tương thích", Value = "Tương thích với thiết bị trợ thính" });
                    }
                }

                // iPhone 17 256GB | Chính hãng
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-17-256gb-chinh-hang");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.3 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "Super Retina XDR OLED" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "48MP Fusion Main f/1.6 OIS 12MP Tele 2x f/1.6 OIS 48MP Ultra Wide f/2.2 120°" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "18MP Center Stage" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Apple A19" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "256 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "Xem video: 30 giờ Xem video trực tuyến: 27 giờ" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "Sim kép (nano-Sim và e-Sim) - Hỗ trợ 2 e-Sim" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "iOS 26" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "2622 x 1206  pixels" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Dynamic Island Màn hình luôn bật HDR 460 ppi True Tone Dải màu rộng (P3) Haptic Touch Tỷ lệ tương phản 2.000.000:1 Độ sáng 1000 nit (typ) Đỉnh 1600 nit (HDR) Đỉnh 3000 nit (ngoài trời) Lớp phủ chống vân tay" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "6 lõi (2 hiệu năng + 4 tiết kiệm điện)" });
                    }
                }

                // Samsung Galaxy S25 Ultra 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-s25-ultra-12gb-256gb");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.9 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "Dynamic AMOLED 2X" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "Camera siêu rộng 50MP Camera góc rộng 200 MP Camera Tele (5x) 50MP Camera Tele (3x) 10MP\"" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "12 MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Snapdragon 8 Elite dành cho Galaxy (3nm)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "12 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "256 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "5000 mAh" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "2 Nano-SIM + eSIM" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "Android 15" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "3120 x 1440 pixels (Quad HD+)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "120Hz 2600 nits Corning® Gorilla® Armor 2" });
                    }
                }

                // iPhone Air 256GB | Chính hãng
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-air-256gb-chinh-hang");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.5 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "Super Retina XDR" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "48MP Fusion Main f/1.6" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "18MP Center Stage f/1.6" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Chip A19 Pro" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "256 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "Xem video: 27 giờ Xem video trực tuyến: 22 giờ" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "2 eSIM" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "iOS 26" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "2736 x 1260 pixels" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Dynamic Island Màn hình luôn bật HDR 460 ppi True Tone Dải màu rộng (P3) Haptic Touch Tỷ lệ tương phản 2.000.000:1 Độ sáng 1000 nit (typ) Đỉnh 1600 nit (HDR) Đỉnh 3000 nit (ngoài trời) Lớp phủ chống vân tay" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "6 lõi (2 hiệu năng + 4 tiết kiệm điện)" });
                    }
                }

                // OPPO Reno15 F 5G 8GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "oppo-reno15-f-5g-8gb-256gb");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.57 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "AMOLED" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "Chính 50MP f/1.8 (OIS" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "50MP f/2.0" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Qualcomm Snapdragon 6 Gen 1 5G" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "8 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "256 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "7000mAh" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "2 Nano SIM (Sim 2 chung khe với thẻ nhớ)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "ColorOS 16.0" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "1080 x 2372 pixels (FullHD+)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "1.07 tỷ màu (10-bit)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "8 nhân" });
                    }
                }

                // iPhone 15 128GB | Chính hãng VN/A
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-15-128gb-chinh-hang-vna");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.1 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "Super Retina XDR OLED" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "Chính 48 MP & Phụ 12 MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "12MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Apple A16 Bionic 6 nhân" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "6 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "128 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "3349 mAh" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "2 SIM (nano‑SIM và eSIM)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "iOS 17" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "2556 x 1179 pixels" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Dynamic Island HDR display True Tone Wide color (P3) Haptic Touch Lớp phủ oleophobia chống dấu vân tay Độ sáng tối đa: 2000 nits Mặt kính cảm ứng: Kính cường lực Ceramic Shield Tần số quét 60 Hz" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện" });
                    }
                }

                // Samsung Galaxy S26 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-s26-12gb-256gb");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.3 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "Dynamic AMOLED 2X" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "Camera siêu rộng: 12MP Camera góc rộng: 50MP Camera Tele: 10MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "12MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Exynos 2600 (2nm)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "12 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "256 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "4300 mAh" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "2 Nano-SIM + eSIM" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "2340 x 1080-pixel" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Tần số quét: 1-120Hz Độ sáng tối đa: 2600 nits" });
                    }
                }

                // Điện thoại iPhone 16 Pro Max 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "dien-thoai-iphone-16-pro-max-256gb");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.9 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "Super Retina XDR OLED" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "Camera chính: 48MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Focus Pixels 100% Telephoto 2x 12MP", Value = "52 mm" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "ƒ/1.6 Camera góc siêu rộng", Value = "48MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "12MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Apple A18 Pro" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "8 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "256 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "Sim kép (nano-Sim và e-Sim) - Hỗ trợ 2 e-Sim" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "iOS 18" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "2868 x 1320 pixels" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Dynamic Island Màn hình Luôn Bật Công nghệ ProMotion với tốc độ làm mới thích ứng lên đến 120Hz Màn hình HDR True Tone Dải màu rộng (P3) Haptic Touch Tỷ lệ tương phản 2.000.000:1" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "CPU 6 lõi mới với 2 lõi hiệu năng và 4 lõi hiệu suất" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tương thích", Value = "Tương Thích Với Thiết Bị Trợ Thính" });
                    }
                }

                // OPPO Reno15 5G 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "oppo-reno15-5g-12gb-256gb");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.59 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "AMOLED" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "Chính 50MP f/1.8 (OIS) + Telephoto 50MP f/2.8 (OIS) + Góc siêu rộng 8MP f/2.2" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "50MP f/2.0" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Qualcomm Snapdragon 7 Gen4 5G" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "12 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "256 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "6500 mAh" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "Dual nano-SIM hoặc 1 nano-SIM + 1 eSIM" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "ColorOS 16.0" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "1256 x 2760 pixels" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Cảm ứng 240Hz" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "8 nhân" });
                    }
                }

                // HONOR X8d 8GB 128GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "honor-x8d-8gb-128gb");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.77 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "AMOLED" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "Camera chính 108MP (f/1.75) + Camera rộng 5MP (f/2.2)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "16MP (f/2.45)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Snapdragon 6s 4G thế hệ 2" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "8 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "128 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "6800mAh (giá trị định mức)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "2 Nano-SIM" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "MagicOS 10 (Dựa trên Android 16)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "1080 x 2392 pixels" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Màu sắc: 1" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "Octa-core" });
                    }
                }

                // Samsung Galaxy Z Fold7 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-z-fold7-12gb-256gb");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "8.0 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "Dynamic AMOLED 2X" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "200 MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "10MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Snapdragon® 8 Elite 3nm for Galaxy" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "12 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "256 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "4400mAh" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "2 Nano-SIM" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "Android" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Tần số quét: 120 Hz Độ phân giải màn hình chính: 2184 x 1968 (QXGA+) Kích cỡ màn hình phụ: 6.5\" Độ phân giải màn hình phụ: 2520 x 1080 (FHD+) Độ sâu màu sắc: 16M" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "8 nhân" });
                    }
                }

                // Samsung Galaxy Z Flip7 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-z-flip7-12gb-256gb");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.9 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "Dynamic AMOLED 2X" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "50 MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "10MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "12 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "256 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "4300mAh" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "2 Nano-SIM" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "Android" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Tần số quét: 120 Hz Độ phân giải màn hình chính: 2520 x 1080 (FHD+) Kích cỡ màn hình phụ: 4.1\" Độ phân giải màn hình phụ: 1048 x 948 Công nghệ màn hình phụ: Super AMOLED Độ sâu màu sắc: 16M" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "10 nhân" });
                    }
                }

                // Samsung Galaxy S26 Ultra 12GB 512GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-s26-ultra-12gb-512gb");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.9 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "Dynamic AMOLED 2X" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "Camera siêu rộng: 50MP Camera góc rộng: 200MP Camera Tele (5x): 50MP Camera Tele (3x): 10MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "12MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Snapdragon 8 Elite Gen 5 dành cho Galaxy (3nm)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "12 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "512 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "5000 mAh" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "2 Nano-SIM + eSIM" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "3120 x 1440 pixels (Quad HD+)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Tần số quét: 1-120Hz Độ sáng tối đa: 2600 nits" });
                    }
                }

                // iPhone 17e 256GB | Chính hãng
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-17e-256gb-chinh-hang");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.1 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "Super Retina XDR" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "48MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "ƒ/1.6 Telephoto 2x", Value = "12MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "12MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Apple A19" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "256 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "Xem video: 26 giờ Xem video trực tuyến: 21 giờ" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "2 SIM (nano‑SIM và eSIM)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "iOS 26" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "2532 x 1170 pixels" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "HDR 460 ppi True Tone Dải màu rộng (P3) Haptic Touch Tỷ lệ tương phản 2.000.000:1 Độ sáng 800 nit (tiêu chuẩn) Độ sáng đỉnh: 1200 nit (HDR)" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện" });
                    }
                }

                // Xiaomi Redmi Note 14 Pro Plus 5G 8GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "xiaomi-redmi-note-14-pro-plus-5g-8gb-256gb");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.67 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "AMOLED" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "Chính 200MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "Camera trước - f/2.2" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Snapdragon® 7s Gen 3" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "8 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "256 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "5110 mAh" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "2 Nano-SIM" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "Android 14" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "2712 x 1220 pixels" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Tần số quét: Lên đến 120Hz Độ sáng: 3000 nits Độ sâu màu: 12-bit Tỷ lệ tương phản: 5" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "000", Value = "1" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "8 nhân" });
                    }
                }

                // iPhone 16e 128GB | Chính hãng VN/A
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-16e-128gb-chinh-hang-vna");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.1 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "Super Retina XDR" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "Hệ thống camera 2 trong 1 Fusion 48MP: 26 mm" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "ảnh có độ phân giải siêu cao (24MP và 48MP) Đồng thời hỗ trợ Telephoto 2x 12MP", Value = "52 mm" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "Camera 12MP Khẩu độ ƒ/1.9 Camera TrueDepth hỗ trợ nhận diện khuôn mặt" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "Chip A18" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Có" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "128 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "Thời gian xem video Lên đến 26 giờ Thời gian xem video (trực tuyến) Lên đến 21 giờ Thời gian nghe nhạc Lên đến 90 giờ" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "Sim kép (nano-Sim và e-Sim) - Hỗ trợ 2 e-Sim" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "iOS 18" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "2532 x 1170 pixels" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Màn hình HDR True Tone Dải màu rộng (P3) Haptic Touch Tỷ lệ tương phản 2.000.000:1 (tiêu chuẩn) Độ sáng tối đa 800 nit (tiêu chuẩn); độ sáng đỉnh 1200 nit (HDR) Lớp phủ kháng dầu chống in dấu vân tay Thu Phóng Màn Hình" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "CPU 6 lõi mới với 2 lõi hiệu năng và 4 lõi tiết kiệm điện" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tương thích", Value = "Sạc USB-C Sạc không dây (tương thích sạc không dây Qi lên đến 7.5W)" });
                    }
                }

                // Samsung Galaxy A07 4GB 128GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-a07-4gb-128gb");
                    if (prod != null)
                    {
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Kích thước màn hình", Value = "6.7 inches" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ màn hình", Value = "IPS LCD" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera sau", Value = "Chính 50 MP Phụ 2 MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Camera trước", Value = "8 MP" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Chipset", Value = "MediaTek Helio G99" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Công nghệ NFC", Value = "Không" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Dung lượng RAM", Value = "4 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Bộ nhớ trong", Value = "128 GB" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Pin", Value = "Li-Ion 5000 mAh" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Thẻ SIM", Value = "2 Nano-SIM" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Hệ điều hành", Value = "Android 15" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Độ phân giải màn hình", Value = "720 x 1600 pixel" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Tính năng màn hình", Value = "Độ sáng tối đa 480 nits Kính cường lực Panda" });
                        allSpecs.Add(new ProductSpecification { ProductId = prod.Id, Name = "Loại CPU", Value = "8 nhân (2 nhân 2.2 GHz & 6 nhân 2.0 GHz)" });
                    }
                }

                await _context.ProductSpecifications.AddRangeAsync(allSpecs);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Seeded {allSpecs.Count} product specifications");
            }
            else
            {
                _logger.LogInformation("Product specifications already exist. Skipping seeding.");
            }
        }

        private async Task SeedProductVariantsAsync()
        {
            _logger.LogInformation("Seeding product variants");

            if (!await _context.ProductVariants.AnyAsync())
            {
                var products = await _context.Products.Include(p => p.Category).ToListAsync();

                // HONOR X9d 12GB 512GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "honor-x9d-12gb-512gb");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Vàng" },
                                new ProductColor { Color = "Đen" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "12GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // Xiaomi POCO F8 Pro 5G 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "xiaomi-poco-f8-pro-5g-12gb-256gb");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Đen" },
                                new ProductColor { Color = "Bạc" },
                                new ProductColor { Color = "Xanh dương" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "12GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // HONOR Magic V5 16GB 512GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "honor-magic-v5-16gb-512gb");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Trắng Ánh Trăng" },
                                new ProductColor { Color = "Vàng Bình Minh" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "16GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // Nothing Phone 2A Plus 5G 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "nothing-phone-2a-plus-5g-12gb-256gb");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Đen" },
                                new ProductColor { Color = "Ghi" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "12GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // Tecno Pova 7 8GB 128GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "tecno-pova-7-8gb-128gb");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Đen" },
                                new ProductColor { Color = "Nâu" },
                                new ProductColor { Color = "Bạc" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "8GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // Tecno Pova 7 8GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "tecno-pova-7-8gb-256gb");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Nâu" },
                                new ProductColor { Color = "Đen" },
                                new ProductColor { Color = "Bạc" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "8GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // iPhone 17 Pro 256GB | Chính hãng
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-17-pro-256gb-chinh-hang");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Cam Vũ Trụ" },
                                new ProductColor { Color = "Bạc" },
                                new ProductColor { Color = "Xanh Đậm" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "256GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // Samsung Galaxy S26 Ultra 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-s26-ultra-12gb-256gb");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Tím Cobalt" },
                                new ProductColor { Color = "Đen Classic" },
                                new ProductColor { Color = "Xanh Sky Blue" },
                                new ProductColor { Color = "Trắng Classic" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "12GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // iPhone 17 Pro Max 256GB | Chính hãng
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-17-pro-max-256gb-chinh-hang");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Xanh đậm" },
                                new ProductColor { Color = "Bạc" },
                                new ProductColor { Color = "Cam Vũ Trụ" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "256GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // iPhone 17 256GB | Chính hãng
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-17-256gb-chinh-hang");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Đen" },
                                new ProductColor { Color = "Xanh Lá Xô Thơm" },
                                new ProductColor { Color = "Tím Oải Hương" },
                                new ProductColor { Color = "Xanh Lam Khói" },
                                new ProductColor { Color = "Trắng" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "256GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // Samsung Galaxy S25 Ultra 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-s25-ultra-12gb-256gb");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Trắng/bạc" },
                                new ProductColor { Color = "Xanh dương" },
                                new ProductColor { Color = "Đen" },
                                new ProductColor { Color = "Xám" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "12GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // iPhone Air 256GB | Chính hãng
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-air-256gb-chinh-hang");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Trắng Mây" },
                                new ProductColor { Color = "Đen Không Gian" },
                                new ProductColor { Color = "Vàng Nhạt" },
                                new ProductColor { Color = "Xanh Da Trời" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "256GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // OPPO Reno15 F 5G 8GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "oppo-reno15-f-5g-8gb-256gb");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Xanh dương" },
                                new ProductColor { Color = "Xanh nhạt" },
                                new ProductColor { Color = "Hồng" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "8GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // iPhone 15 128GB | Chính hãng VN/A
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-15-128gb-chinh-hang-vna");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Đen" },
                                new ProductColor { Color = "Xanh dương" },
                                new ProductColor { Color = "Hồng" },
                                new ProductColor { Color = "Vàng" },
                                new ProductColor { Color = "Xanh lá" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "128GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // Samsung Galaxy S26 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-s26-12gb-256gb");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Trắng Classic" },
                                new ProductColor { Color = "Xanh Sky Blue" },
                                new ProductColor { Color = "Đen Classic" },
                                new ProductColor { Color = "Tím Cobalt" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "12GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // Điện thoại iPhone 16 Pro Max 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "dien-thoai-iphone-16-pro-max-256gb");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Titan Sa Mạc" },
                                new ProductColor { Color = "Titan Đen" },
                                new ProductColor { Color = "Titan Tự Nhiên" },
                                new ProductColor { Color = "Titan Trắng" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "256GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // OPPO Reno15 5G 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "oppo-reno15-5g-12gb-256gb");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Trắng" },
                                new ProductColor { Color = "Xanh dương" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "12GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // HONOR X8d 8GB 128GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "honor-x8d-8gb-128gb");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Xanh" },
                                new ProductColor { Color = "Xám" },
                                new ProductColor { Color = "Đen" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "8GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // Samsung Galaxy Z Fold7 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-z-fold7-12gb-256gb");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Xám bóng" },
                                new ProductColor { Color = "Đen tuyền" },
                                new ProductColor { Color = "Xanh bóng" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "12GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // Samsung Galaxy Z Flip7 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-z-flip7-12gb-256gb");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Đỏ san hô" },
                                new ProductColor { Color = "Xanh bóng" },
                                new ProductColor { Color = "Đen tuyền" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "12GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // Samsung Galaxy S26 Ultra 12GB 512GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-s26-ultra-12gb-512gb");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Tím Cobalt" },
                                new ProductColor { Color = "Trắng Classic" },
                                new ProductColor { Color = "Xanh Sky Blue" },
                                new ProductColor { Color = "Đen Classic" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "12GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // iPhone 17e 256GB | Chính hãng
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-17e-256gb-chinh-hang");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Trắng" },
                                new ProductColor { Color = "Đen" },
                                new ProductColor { Color = "Hồng" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "256GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // Xiaomi Redmi Note 14 Pro Plus 5G 8GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "xiaomi-redmi-note-14-pro-plus-5g-8gb-256gb");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Vàng (Chỉ có tại CPS)" },
                                new ProductColor { Color = "Tím" },
                                new ProductColor { Color = "Đen" },
                                new ProductColor { Color = "Xanh dương" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "8GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // iPhone 16e 128GB | Chính hãng VN/A
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-16e-128gb-chinh-hang-vna");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Đen" },
                                new ProductColor { Color = "Trắng" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "128GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                // Samsung Galaxy A07 4GB 128GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-a07-4gb-128gb");
                    if (prod != null)
                    {
                        var variant = new ProductVariants
                        {
                            ProductId = prod.Id,
                            Colors = new List<ProductColor>
                            {
                                new ProductColor { Color = "Xanh lục bảo" },
                                new ProductColor { Color = "Tím bạc" },
                                new ProductColor { Color = "Đen huyền" },
                            },
                            Sizes = new List<ProductSize>
                            {
                                new ProductSize { Size = "4GB" },
                            }
                        };
                        await _context.ProductVariants.AddAsync(variant);
                    }
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Seeded product variants");
            }
            else
            {
                _logger.LogInformation("Product variants already exist. Skipping seeding.");
            }
        }

        private async Task SeedProductImagesAsync()
        {
            _logger.LogInformation("Seeding product images");

            if (!await _context.ProductImages.AnyAsync())
            {
                var products = await _context.Products.ToListAsync();

                // HONOR X9d 12GB 512GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "honor-x9d-12gb-512gb");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // Xiaomi POCO F8 Pro 5G 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "xiaomi-poco-f8-pro-5g-12gb-256gb");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // HONOR Magic V5 16GB 512GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "honor-magic-v5-16gb-512gb");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // Nothing Phone 2A Plus 5G 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "nothing-phone-2a-plus-5g-12gb-256gb");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // Tecno Pova 7 8GB 128GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "tecno-pova-7-8gb-128gb");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // Tecno Pova 7 8GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "tecno-pova-7-8gb-256gb");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // iPhone 17 Pro 256GB | Chính hãng
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-17-pro-256gb-chinh-hang");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // Samsung Galaxy S26 Ultra 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-s26-ultra-12gb-256gb");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // iPhone 17 Pro Max 256GB | Chính hãng
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-17-pro-max-256gb-chinh-hang");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // iPhone 17 256GB | Chính hãng
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-17-256gb-chinh-hang");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // Samsung Galaxy S25 Ultra 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-s25-ultra-12gb-256gb");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // iPhone Air 256GB | Chính hãng
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-air-256gb-chinh-hang");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // OPPO Reno15 F 5G 8GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "oppo-reno15-f-5g-8gb-256gb");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // iPhone 15 128GB | Chính hãng VN/A
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-15-128gb-chinh-hang-vna");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // Samsung Galaxy S26 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-s26-12gb-256gb");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // Điện thoại iPhone 16 Pro Max 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "dien-thoai-iphone-16-pro-max-256gb");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // OPPO Reno15 5G 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "oppo-reno15-5g-12gb-256gb");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // HONOR X8d 8GB 128GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "honor-x8d-8gb-128gb");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // Samsung Galaxy Z Fold7 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-z-fold7-12gb-256gb");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // Samsung Galaxy Z Flip7 12GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-z-flip7-12gb-256gb");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // Samsung Galaxy S26 Ultra 12GB 512GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-s26-ultra-12gb-512gb");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // iPhone 17e 256GB | Chính hãng
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-17e-256gb-chinh-hang");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // Xiaomi Redmi Note 14 Pro Plus 5G 8GB 256GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "xiaomi-redmi-note-14-pro-plus-5g-8gb-256gb");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // iPhone 16e 128GB | Chính hãng VN/A
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "iphone-16e-128gb-chinh-hang-vna");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }
                // Samsung Galaxy A07 4GB 128GB
                {
                    var prod = products.FirstOrDefault(p => p.Slug == "samsung-galaxy-a07-4gb-128gb");
                    if (prod != null)
                    {
                        await _context.ProductImages.AddRangeAsync(new List<ProductImage>
                        {
                            new ProductImage { ProductId = prod.Id, Url = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg" },
                        });
                    }
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Seeded product images");
            }
            else
            {
                _logger.LogInformation("Product images already exist. Skipping seeding.");
            }
        }

        private async Task SeedReviewsAsync()
        {
            _logger.LogInformation("Seeding reviews...");

            if (!await _context.Reviews.AnyAsync()) // Kiểm tra xem đã có review chưa
            {
                var products = await _context.Products.ToListAsync(); // Lấy danh sách sản phẩm
                var users = await _context.Users.ToListAsync(); // Lấy danh sách người dùng

                if (!products.Any() || !users.Any())
                {
                    _logger.LogWarning("No products or users found. Skipping review seeding.");
                    return;
                }

                var random = new Random();
                var reviews = new List<Review>();

                foreach (var product in products)
                {
                    for (int i = 0; i < random.Next(3, 6); i++) // Mỗi sản phẩm có 3-5 đánh giá
                    {
                        var user = users[random.Next(users.Count)];
                        var reviewId = Guid.NewGuid();

                        var review = new Review
                        {
                            Id = reviewId,
                            UserName = user.UserName ?? string.Empty,
                            UserAvatar = "users/avatar-20250521154845412-fd9c4c.jpg",
                            Rating = random.Next(1, 6),
                            Date = DateTime.Now.AddDays(-random.Next(30)),
                            Content = $"This is a sample review for {product.Name}.",
                            Likes = random.Next(0, 50),
                            Replies = random.Next(0, 5),
                            IsVerified = random.Next(0, 2) == 1,
                            HelpfulCount = random.Next(0, 20),
                            ProductId = product.Id,
                            ApplicationUserId = user.Id
                        };

                        reviews.Add(review);
                    }
                }

                await _context.Reviews.AddRangeAsync(reviews);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Seeded {reviews.Count} reviews.");

                // Seed Review Images
                var reviewImages = new List<ReviewImage>();

                foreach (var review in reviews)
                {
                    for (int j = 0; j < random.Next(1, 4); j++) // Mỗi review có 1-3 ảnh
                    {
                        reviewImages.Add(new ReviewImage
                        {
                            Id = Guid.NewGuid(),
                            ReviewId = review.Id,
                            Url = "products/product-20250519151510514-07077d.jpg"
                        });
                    }
                }

                //await _context.Reviews.AddRangeAsync(reviewImages);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Seeded {reviewImages.Count} review images.");
            }
            else
            {
                _logger.LogInformation("Reviews already exist. Skipping seeding.");
            }
        }

        private async Task SeedAboutAndContactAsync()
        {
            _logger.LogInformation("Seeding About and Contact data");

            // Seed About data if empty
            if (!await _context.Abouts.AnyAsync())
            {
                var about = new About
                {
                    Id = Guid.NewGuid(),
                    Hero = new HeroSection
                    {
                        Title = "Câu Chuyện Của Chúng Tôi",
                        Description = "Chúng tôi có sứ mệnh cung cấp các sản phẩm chất lượng cao nhằm nâng cao cuộc sống hàng ngày của bạn."
                    },
                    Values = new List<ValueItem>
                    {
                        new ValueItem
                        {
                            Id = Guid.NewGuid(),
                            Title = "Chất Lượng Là Hàng Đầu",
                            Description = "Chúng tôi tin vào việc cung cấp các sản phẩm vượt trội về chất lượng và độ bền."
                        },
                        new ValueItem
                        {
                            Id = Guid.NewGuid(),
                            Title = "Sự Hài Lòng Của Khách Hàng",
                            Description = "Sự hài lòng của bạn là ưu tiên hàng đầu. Chúng tôi cam kết cung cấp dịch vụ xuất sắc."
                        },
                        new ValueItem
                        {
                            Id = Guid.NewGuid(),
                            Title = "Phát Triển Bền Vững",
                            Description = "Chúng tôi tận tâm với các hoạt động bền vững nhằm giảm thiểu tác động đến môi trường."
                        }
                    },
                    History = new HistorySection
                    {
                        Title = "Từ Những Bước Đầu Nhỏ Bé",
                        Paragraphs = new List<HistoryParagraph>
                        {
                            new HistoryParagraph
                            {
                                Id = Guid.NewGuid(),
                                Content = "Được thành lập vào năm 2010, công ty chúng tôi bắt đầu là một cửa hàng trực tuyến nhỏ..."
                            },
                            new HistoryParagraph
                            {
                                Id = Guid.NewGuid(),
                                Content = "Khi tiếng tăm về cam kết xuất sắc của chúng tôi lan rộng..."
                            },
                            new HistoryParagraph
                            {
                                Id = Guid.NewGuid(),
                                Content = "Ngày nay, chúng tôi cung cấp hàng trăm sản phẩm cho khách hàng..."
                            }
                        }
                    },
                    Team = new List<TeamMember>
                    {
                        new TeamMember
                        {
                            Id = Guid.NewGuid(),
                            Name = "Nguyễn Thị Minh",
                            Role = "Nhà Sáng Lập & CEO",
                            ImageUrl = "users/avatar-20250521154845412-fd9c4c.jpg",
                            Bio = "Với hơn 15 năm kinh nghiệm trong ngành bán lẻ, Minh lãnh đạo công ty chúng tôi với niềm đam mê và tầm nhìn."
                        },
                        new TeamMember
                        {
                            Id = Guid.NewGuid(),
                            Name = "Trần Văn Hải",
                            Role = "Giám Đốc Sản Phẩm",
                            ImageUrl = "users/avatar-20250521154845412-fd9c4c.jpg",
                            Bio = "Hải đảm bảo rằng mỗi sản phẩm chúng tôi cung cấp đều đáp ứng các tiêu chuẩn cao về chất lượng và thiết kế."
                        },
                        new TeamMember
                        {
                            Id = Guid.NewGuid(),
                            Name = "Lê Thị Hương",
                            Role = "Trải Nghiệm Khách Hàng",
                            ImageUrl = "users/avatar-20250521154845412-fd9c4c.jpg",
                            Bio = "Hương làm việc không mệt mỏi để đảm bảo rằng mỗi khách hàng đều có trải nghiệm mua sắm tuyệt vời."
                        },
                        new TeamMember
                        {
                            Id = Guid.NewGuid(),
                            Name = "Phạm Minh Tuấn",
                            Role = "Quản Lý Vận Hành",
                            ImageUrl = "users/avatar-20250521154845412-fd9c4c.jpg",
                            Bio = "Tuấn giám sát hậu cần của chúng tôi để đảm bảo giao hàng đúng hẹn và hoạt động hiệu quả."
                        }
                    },
                    Cta = new CtaSection
                    {
                        Title = "Sẵn Sàng Trải Nghiệm Sự Khác Biệt?",
                        Description = "Khám phá bộ sưu tập các sản phẩm chất lượng cao được thiết kế để nâng cao cuộc sống hàng ngày của bạn."
                    },
                    CreatedAt = DateTime.Now,
                    IsActive = true
                };

                await _context.Abouts.AddAsync(about);
                _logger.LogInformation("Seeded About data");
            }
            else
            {
                _logger.LogInformation("About data already exists. Skipping seeding.");
            }

            // Seed Contact data if empty
            if (!await _context.Contacts.AnyAsync())
            {
                var contact = new Contact
                {
                    Id = Guid.NewGuid(),
                    Phone = new ContactInfo
                    {
                        Value = "+84 (234) 567-890",
                        Description = "Thứ Hai - Thứ Sáu từ 8h đến 17h"
                    },
                    Email = new ContactInfo
                    {
                        Value = "hotro@example.com",
                        Description = "Chúng tôi sẽ phản hồi trong thời gian sớm nhất"
                    },
                    Office = new ContactInfo
                    {
                        Value = "123 Đường Lê Lợi\nPhường Bến Nghé\nQuận 1, TP.HCM",
                        Description = "Ghé thăm văn phòng của chúng tôi"
                    },
                    SocialLinks = new List<SocialLink>
                    {
                        new SocialLink
                        {
                            Id = Guid.NewGuid(),
                            Name = "Facebook",
                            Url = "https://facebook.com/example"
                        },
                        new SocialLink
                        {
                            Id = Guid.NewGuid(),
                            Name = "Twitter",
                            Url = "https://twitter.com/example"
                        },
                        new SocialLink
                        {
                            Id = Guid.NewGuid(),
                            Name = "Instagram",
                            Url = "https://instagram.com/example"
                        }
                    },
                    Faqs = new List<FaqItem>
                    {
                        new FaqItem
                        {
                            Id = Guid.NewGuid(),
                            Question = "Thời gian giao hàng là bao lâu?",
                            Answer = "Chúng tôi thường xử lý và gửi đơn hàng trong vòng 1-2 ngày làm việc. Thời gian giao hàng tùy thuộc vào địa điểm, thường từ 3-7 ngày làm việc."
                        },
                        new FaqItem
                        {
                            Id = Guid.NewGuid(),
                            Question = "Có giao hàng quốc tế không?",
                            Answer = "Có, chúng tôi giao hàng đến hầu hết các quốc gia trên thế giới. Thời gian và phí giao hàng quốc tế thay đổi tùy theo điểm đến."
                        },
                        new FaqItem
                        {
                            Id = Guid.NewGuid(),
                            Question = "Chính sách đổi trả như thế nào?",
                            Answer = "Chúng tôi cung cấp chính sách đổi trả trong vòng 30 ngày cho hầu hết các mặt hàng. Sản phẩm phải còn nguyên trạng với nhãn mác đính kèm."
                        },
                        new FaqItem
                        {
                            Id = Guid.NewGuid(),
                            Question = "Làm thế nào để theo dõi đơn hàng?",
                            Answer = "Khi đơn hàng của bạn được gửi đi, bạn sẽ nhận được email xác nhận kèm theo thông tin theo dõi."
                        }
                    },
                    CreatedAt = DateTime.Now,
                    IsActive = true
                };

                await _context.Contacts.AddAsync(contact);
                _logger.LogInformation("Seeded Contact data");
            }
            else
            {
                _logger.LogInformation("Contact data already exists. Skipping seeding.");
            }

            await _context.SaveChangesAsync();
        }

        private async Task SeedBannersAsync()
        {
            _logger.LogInformation("Seeding banners");

            if (!await _context.Banners.AnyAsync())
            {
                var banners = new List<Banner>
                {
                    new Banner
                    {
                        Title = "Giảm 50% - Mùa hè rực rỡ",
                        Description = "Ưu đãi đặc biệt cho tất cả sản phẩm thời trang mùa hè",
                        ImageUrl = "banners/neutral-minimalist-summer-fashion-sale-banner-20250804151856963-cb21e9.png",
                        ButtonText = "Mua ngay",
                        ButtonLink = "/products?category=fashion&sale=summer"
                    },
                    new Banner
                    {
                        Title = "Điện tử giảm sốc",
                        Description = "Giảm đến 30% cho các sản phẩm điện tử cao cấp",
                        ImageUrl = "banners/gray-minimalist-fashion-big-sale-banner-20250804151827077-1f03c6.png",
                        ButtonText = "Khám phá",
                        ButtonLink = "/products?category=electronics&sale=true"
                    },
                    new Banner
                    {
                        Title = "Ưu đãi gia dụng",
                        Description = "Mua 1 tặng 1 cho tất cả sản phẩm gia dụng",
                        ImageUrl = "banners/brown-modern-fashion-(banner-(landscape))-20250804151909078-70d252.png",
                        ButtonText = "Xem ngay",
                        ButtonLink = "/products?category=home&promotion=buy1get1"
                    }
                };

                await _context.Banners.AddRangeAsync(banners);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Seeded {banners.Count} banners");
            }
            else
            {
                _logger.LogInformation("Banners already exist. Skipping seeding.");
            }
        }

        public static string GenerateSku(string brandCode, string categoryCode, string productCode)
        {
            // Tạo SKU theo cấu trúc: BRAND-CATEGORY-PRODUCT
            return $"{brandCode}-{categoryCode}-{productCode}";
        }

    }
}