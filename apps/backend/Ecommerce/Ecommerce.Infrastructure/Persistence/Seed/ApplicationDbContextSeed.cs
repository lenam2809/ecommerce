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

        public static async Task SeedAsync(IServiceProvider serviceProvider)
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

                // Ensure database is created and migrated
                await context.Database.MigrateAsync();

                var seeder = new ApplicationDbContextSeed(logger, context, userManager, roleManager);
                await seeder.SeedAllAsync();

                logger.LogInformation("Database seeding completed successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database");
                throw;
            }
        }

        public async Task SeedAllAsync()
        {
            // Seed in specific order to handle dependencies
            var permissions = await SeedPermissionsAsync();
            var roles = await SeedRolesAsync();
            var users = await SeedUsersAsync();

            await SeedRolePermissionsAsync(roles, permissions);
            await SeedUserRolesAsync(users, roles);

            // Add test data
            await SeedBrandsAsync();
            await SeedCategoriesAsync();
            await SeedProductsAsync();
            await SeedProductSpecificationsAsync();
            await SeedReviewsAsync();
            await SeedAboutAndContactAsync();
            await SeedProductVariantsAsync();
            await SeedProductImagesAsync();

            await SeedBannersAsync();

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
                    roleEntities.Add(await _roleManager.FindByNameAsync(roleName));
                }
            }

            return roleEntities;
        }

        private async Task<List<ApplicationUser>> SeedUsersAsync()
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
                    Avatar = "/uploads/users/avatar-20250521154845412-fd9c4c.jpg",
                    CustomerLevel = ECustomerLevel.Diamond,
                    PromotionPoints = 1000
                };

                var result = await _userManager.CreateAsync(adminUser, "Admin@123");
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

                var result = await _userManager.CreateAsync(managerUser, "Manager@123");
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

                var result = await _userManager.CreateAsync(staffUser, "Staff@123");
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
                if (!await _userManager.IsInRoleAsync(adminUser, adminRole.Name))
                {
                    await _userManager.AddToRoleAsync(adminUser, adminRole.Name);
                    _logger.LogInformation($"Assigned {adminRole.Name} role to {adminUser.Email}");
                }
            }

            if (managerUser != null && managerRole != null)
            {
                if (!await _userManager.IsInRoleAsync(managerUser, managerRole.Name))
                {
                    await _userManager.AddToRoleAsync(managerUser, managerRole.Name);
                    _logger.LogInformation($"Assigned {managerRole.Name} role to {managerUser.Email}");
                }
            }

            if (staffUser != null && staffRole != null)
            {
                if (!await _userManager.IsInRoleAsync(staffUser, staffRole.Name))
                {
                    await _userManager.AddToRoleAsync(staffUser, staffRole.Name);
                    _logger.LogInformation($"Assigned {staffRole.Name} role to {staffUser.Email}");
                }
            }

            if (customerUser != null && customerRole != null)
            {
                if (!await _userManager.IsInRoleAsync(customerUser, customerRole.Name))
                {
                    await _userManager.AddToRoleAsync(customerUser, customerRole.Name);
                    _logger.LogInformation($"Assigned {customerRole.Name} role to {customerUser.Email}");
                }
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
                        Image = "/uploads/categories/dien-thoai-di-dong-20250806135102102-1a8c21.jpg"
                    },
                    new Category
                    {
                        Code = "Laptop",
                        Name = "Laptop",
                        Description = "Máy tính xách tay và máy tính di động",
                        Slug = "laptop",
                        Image = "/uploads/categories/laptop-20250806135334578-e5f6f1.jpg"
                    },
                    new Category
                    {
                        Code = "MTB",
                        Name = "Máy Tính Bảng",
                        Description = "Thiết bị máy tính di động màn hình lớn",
                        Slug = "may-tinh-bang",
                        Image = "/uploads/categories/may-tinh-bang-20250806135528696-3aa918.png"
                    },
                    new Category
                    {
                        Code = "PKCN",
                        Name = "Phụ Kiện Công Nghệ",
                        Description = "Phụ kiện điện tử và công nghệ",
                        Slug = "phu-kien-cong-nghe",
                        Image = "/uploads/categories/phukien_mobile-20250806135918105-e4120f.jpg"
                    },
                    new Category
                    {
                        Code = "MS",
                        Name = "Âm Thanh",
                        Description = "Tai nghe, loa và thiết bị âm thanh",
                        Slug = "am-thanh",
                        Image = "/uploads/categories/am_thanh-20250806140035285-d8bd3a.png"
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
                        LogoUrl = "/uploads/brands/apple-20250804141605152-f35842.png"
                    },
                    new Brand
                    {
                        Code = "Samsung",
                        Name = "Samsung",
                        Description = "Thương hiệu điện tử hàng đầu Hàn Quốc",
                        Slug = "samsung",
                        LogoUrl = "/uploads/brands/samsung-20250804141704270-15eab4.png"
                    },
                    new Brand
                    {
                        Code = "Sony",
                        Name = "Sony",
                        Description = "Chuyên sản xuất thiết bị điện tử chất lượng cao",
                        Slug = "sony",
                        LogoUrl = "/uploads/brands/sony-20250804141716260-f6dc0b.png"
                    },
                    new Brand
                    {
                        Code = "Dell",
                        Name = "Dell",
                        Description = "Nhà sản xuất máy tính và thiết bị công nghệ",
                        Slug = "dell",
                        LogoUrl = "/uploads/brands/dell-20250804141613099-1e0e20.png"
                    },
                    new Brand
                    {
                        Code = "Xiaomi",
                        Name = "Xiaomi",
                        Description = "Thương hiệu điện thoại Trung Quốc nổi tiếng",
                        Slug = "xiaomi",
                        LogoUrl = "/uploads/brands/xiaomi-20250804141728483-78b792.png"
                    }
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
        private async Task SeedProductsAsync()
        {
            _logger.LogInformation("Seeding products");

            if (!await _context.Products.AnyAsync())
            {
                var categories = await _context.Categories.ToListAsync();
                var brands = await _context.Brands.ToListAsync();

                if (categories.Any() && brands.Any())
                {
                    var products = new List<Product>();

                    // 1. Điện Thoại Di Động
                    var catPhone = categories.FirstOrDefault(c => c.Code == "DTDĐ");
                    if (catPhone != null)
                    {
                        var apple = brands.FirstOrDefault(b => b.Code == "Apple");
                        if (apple != null)
                        {
                            var p = Product.Create(
                                "IP15PM",
                                "iPhone 15 Pro Max",
                                "iphone-15-pro-max",
                                GenerateSku(apple.Code, catPhone.Code, "IP15PM"),
                                34990000,
                                33990000,
                                "/uploads/products/product1-20250418095632309-8a946b.jpg",
                                "iPhone 15 Pro Max. Thiết kế titan chuẩn hàng không vũ trụ. Chip A17 Pro mạnh mẽ. Nút Tác Vụ tùy chỉnh. Hệ thống camera chuyên nghiệp mạnh mẽ nhất trên iPhone.",
                                100,
                                catPhone.Id,
                                apple.Id
                            );
                            p.UpdateRating(4.9, 250);
                            products.Add(p);
                        }

                        var samsung = brands.FirstOrDefault(b => b.Code == "Samsung");
                        if (samsung != null)
                        {
                            var p = Product.Create(
                                "S24U",
                                "Samsung Galaxy S24 Ultra",
                                "samsung-galaxy-s24-ultra",
                                GenerateSku(samsung.Code, catPhone.Code, "S24U"),
                                33990000,
                                29990000,
                                "/uploads/products/product-20250519151510514-07077d.jpg",
                                "Quyền năng Galaxy AI. Khuôn máy bằng titan bền bỉ. Camera 200MP. Chip Snapdragon 8 Gen 3 for Galaxy.",
                                80,
                                catPhone.Id,
                                samsung.Id
                            );
                            p.UpdateRating(4.8, 180);
                            products.Add(p);
                        }

                        var xiaomi = brands.FirstOrDefault(b => b.Code == "Xiaomi");
                        if (xiaomi != null)
                        {
                            var p = Product.Create(
                                "MI14U",
                                "Xiaomi 14 Ultra",
                                "xiaomi-14-ultra",
                                GenerateSku(xiaomi.Code, catPhone.Code, "MI14U"),
                                29990000,
                                27990000,
                                "/uploads/products/product1-20250418095906471-dddf5e.jpg",
                                "Hệ thống camera Leica thế hệ mới. Cảm biến 1 inch. Snapdragon 8 Gen 3. Màn hình LTPO AMOLED 2K+.",
                                50,
                                catPhone.Id,
                                xiaomi.Id
                            );
                            p.UpdateRating(4.7, 90);
                            products.Add(p);
                        }
                    }

                    // 2. Laptop
                    var catLaptop = categories.FirstOrDefault(c => c.Code == "Laptop");
                    if (catLaptop != null)
                    {
                        var apple = brands.FirstOrDefault(b => b.Code == "Apple");
                        if (apple != null)
                        {
                            var p = Product.Create(
                                "MBP14M3",
                                "MacBook Pro 14 M3",
                                "macbook-pro-14-m3",
                                GenerateSku(apple.Code, catLaptop.Code, "MBP14M3"),
                                39990000,
                                null,
                                "/uploads/products/product1-20250418095632309-8a946b.jpg",
                                "MacBook Pro 14 inch với chip M3. Hiệu năng đột phá. Thời lượng pin lên đến 22 giờ. Màn hình Liquid Retina XDR.",
                                40,
                                catLaptop.Id,
                                apple.Id
                            );
                            p.UpdateRating(5.0, 65);
                            products.Add(p);
                        }

                        var dell = brands.FirstOrDefault(b => b.Code == "Dell");
                        if (dell != null)
                        {
                            var p = Product.Create(
                                "XPS15",
                                "Dell XPS 15 9530",
                                "dell-xps-15-9530",
                                GenerateSku(dell.Code, catLaptop.Code, "XPS15"),
                                45990000,
                                43990000,
                                "/uploads/products/product-20250519151510514-07077d.jpg",
                                "Thiết kế tinh xảo, hiệu năng mạnh mẽ với Intel Core i7 dòng H và card đồ họa RTX 4050. Màn hình OLED 3.5K.",
                                20,
                                catLaptop.Id,
                                dell.Id
                            );
                            p.UpdateRating(4.6, 30);
                            products.Add(p);
                        }
                    }

                    // 3. Máy Tính Bảng
                    var catTablet = categories.FirstOrDefault(c => c.Code == "MTB");
                    if (catTablet != null)
                    {
                        var apple = brands.FirstOrDefault(b => b.Code == "Apple");
                        if (apple != null)
                        {
                            var p = Product.Create(
                                "IPADPROM4",
                                "iPad Pro 11 M4",
                                "ipad-pro-11-m4",
                                GenerateSku(apple.Code, catTablet.Code, "IPADM4"),
                                28990000,
                                27500000,
                                "/uploads/products/product1-20250418095906471-dddf5e.jpg",
                                "iPad Pro mỏng nhất từ trước đến nay. Hiệu năng M4 cực đỉnh. Màn hình Ultra Retina XDR OLED.",
                                60,
                                catTablet.Id,
                                apple.Id
                            );
                            p.UpdateRating(4.9, 45);
                            products.Add(p);
                        }

                        var xiaomi = brands.FirstOrDefault(b => b.Code == "Xiaomi");
                        if (xiaomi != null)
                        {
                            var p = Product.Create(
                                "MIPAD6",
                                "Xiaomi Pad 6",
                                "xiaomi-pad-6",
                                GenerateSku(xiaomi.Code, catTablet.Code, "PAD6"),
                                8990000,
                                7990000,
                                "/uploads/products/product-20250519151510514-07077d.jpg",
                                "Màn hình 144Hz WQHD+ bảo vệ mắt. Snapdragon 870. Pin 8840mAh, sạc nhanh 33W.",
                                120,
                                catTablet.Id,
                                xiaomi.Id
                            );
                            p.UpdateRating(4.5, 200);
                            products.Add(p);
                        }
                    }

                    // 4. Âm Thanh
                    var catAudio = categories.FirstOrDefault(c => c.Code == "MS");
                    if (catAudio != null)
                    {
                        var sony = brands.FirstOrDefault(b => b.Code == "Sony");
                        if (sony != null)
                        {
                            var p = Product.Create(
                                "XM5",
                                "Sony WH-1000XM5",
                                "sony-wh-1000xm5",
                                GenerateSku(sony.Code, catAudio.Code, "XM5"),
                                8490000,
                                7590000,
                                "/uploads/products/product1-20250418095632309-8a946b.jpg",
                                "Tai nghe chống ồn tốt nhất của Sony. Thiết kế mới thoải mái hơn. Chất âm Hi-Res Audio.",
                                45,
                                catAudio.Id,
                                sony.Id
                            );
                            p.UpdateRating(4.8, 150);
                            products.Add(p);
                        }

                        var apple = brands.FirstOrDefault(b => b.Code == "Apple");
                        if (apple != null)
                        {
                            var p = Product.Create(
                                "APP2",
                                "AirPods Pro 2 USB-C",
                                "airpods-pro-2-usb-c",
                                GenerateSku(apple.Code, catAudio.Code, "APP2"),
                                5990000,
                                5590000,
                                "/uploads/products/product1-20250418095906471-dddf5e.jpg",
                                "Chủ động khử tiếng ồn hiệu quả hơn gấp 2 lần. Chế độ xuyên âm thích ứng. Âm thanh không gian cá nhân hóa.",
                                200,
                                catAudio.Id,
                                apple.Id
                            );
                            p.UpdateRating(4.9, 500);
                            products.Add(p);
                        }
                    }

                     // 5. Phụ kiện
                    var catAccessory = categories.FirstOrDefault(c => c.Code == "PKCN");
                    if (catAccessory != null)
                    {
                         var apple = brands.FirstOrDefault(b => b.Code == "Apple");
                        if (apple != null)
                        {
                            var p = Product.Create(
                                "20W",
                                "Sạc 20W USB-C Power Adapter",
                                "apple-20w-usb-c-power-adapter",
                                GenerateSku(apple.Code, catAccessory.Code, "20W"),
                                550000,
                                490000,
                                "/uploads/products/product-20250519151510514-07077d.jpg",
                                "Củ sạc nhanh chính hãng Apple. Tương thích tốt nhất với iPhone và iPad.",
                                500,
                                catAccessory.Id,
                                apple.Id
                            );
                            p.UpdateRating(4.9, 1000);
                            products.Add(p);
                        }
                    }

                    await _context.Products.AddRangeAsync(products);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"Seeded {products.Count} products");
                }
            }
            else
            {
                _logger.LogInformation("Products already exist. Skipping seeding.");
            }
        }

        private async Task SeedProductVariantsAsync()
        {
            _logger.LogInformation("Seeding product variants");

            if (!await _context.ProductVariants.AnyAsync())
            {
                // Include Categories to check logic
                var products = await _context.Products.Include(p => p.Category).ToListAsync();

                foreach (var product in products)
                {
                    var productVariant = new ProductVariants
                    {
                        ProductId = product.Id,
                        Colors = new List<ProductColor>(),
                        Sizes = new List<ProductSize>()
                    };

                    // Logic theo danh mục
                    if (product.Category.Code == "DTDĐ" || product.Category.Code == "MTB")
                    {
                        // Điện thoại/Tablet: Màu sắc và Dung lượng
                        productVariant.Colors.Add(new ProductColor { Color = "Titan Đen" });
                        productVariant.Colors.Add(new ProductColor { Color = "Titan Tự Nhiên" });
                        productVariant.Colors.Add(new ProductColor { Color = "Titan Xanh" });

                        productVariant.Sizes.Add(new ProductSize { Size = "256GB" });
                        productVariant.Sizes.Add(new ProductSize { Size = "512GB" });
                        productVariant.Sizes.Add(new ProductSize { Size = "1TB" });
                    }
                    else if (product.Category.Code == "Laptop")
                    {
                        // Laptop: Màu và Cấu hình (RAM/SSD)
                        productVariant.Colors.Add(new ProductColor { Color = "Bạc (Silver)" });
                        productVariant.Colors.Add(new ProductColor { Color = "Xám (Space Grey)" });

                        productVariant.Sizes.Add(new ProductSize { Size = "16GB/512GB" });
                        productVariant.Sizes.Add(new ProductSize { Size = "32GB/1TB" });
                    }
                    else if (product.Category.Code == "MS") // Âm thanh
                    {
                        productVariant.Colors.Add(new ProductColor { Color = "Đen" });
                        productVariant.Colors.Add(new ProductColor { Color = "Trắng" });
                        
                        productVariant.Sizes.Add(new ProductSize { Size = "Tiêu chuẩn" });
                    }
                    else
                    {
                         // Phụ kiện và mặc định
                        productVariant.Colors.Add(new ProductColor { Color = "Trắng" });
                        productVariant.Colors.Add(new ProductColor { Color = "Đen" });
                        productVariant.Sizes.Add(new ProductSize { Size = "Tiêu chuẩn" });
                    }

                    await _context.ProductVariants.AddAsync(productVariant);
                }
                 await _context.SaveChangesAsync();
                 _logger.LogInformation("Seeded product variants");
            }
            else
            {
                _logger.LogInformation("Product variants already exist. Skipping seeding.");
            }
        }

        private async Task SeedProductSpecificationsAsync()
        {
            _logger.LogInformation("Seeding product specifications...");

            if (!await _context.ProductSpecifications.AnyAsync())
            {
                var products = await _context.Products.Include(p => p.Category).ToListAsync();

                foreach (var product in products)
                {
                    var specs = new List<ProductSpecification>();

                     if (product.Category.Code == "DTDĐ")
                    {
                        specs.Add(new ProductSpecification { ProductId = product.Id, Name = "Màn hình", Value = "6.7 inch OLED 120Hz" });
                        specs.Add(new ProductSpecification { ProductId = product.Id, Name = "Camera sau", Value = "48MP + 12MP + 12MP" });
                        specs.Add(new ProductSpecification { ProductId = product.Id, Name = "Camera trước", Value = "12MP" });
                        specs.Add(new ProductSpecification { ProductId = product.Id, Name = "Pin", Value = "5000mAh, Sạc nhanh" });
                    }
                    else if (product.Category.Code == "Laptop")
                    {
                        specs.Add(new ProductSpecification { ProductId = product.Id, Name = "CPU", Value = "Intel Core Ultra / Apple M3" });
                        specs.Add(new ProductSpecification { ProductId = product.Id, Name = "RAM", Value = "16GB/32GB LPDDR5X" });
                        specs.Add(new ProductSpecification { ProductId = product.Id, Name = "Ổ cứng", Value = "512GB/1TB SSD NVMe" });
                        specs.Add(new ProductSpecification { ProductId = product.Id, Name = "Màn hình", Value = "14 inch - 16 inch High Resolution" });
                    }
                     else if (product.Category.Code == "MTB")
                    {
                        specs.Add(new ProductSpecification { ProductId = product.Id, Name = "Màn hình", Value = "11 inch - 13 inch" });
                        specs.Add(new ProductSpecification { ProductId = product.Id, Name = "Kết nối", Value = "Wifi 6E, 5G" });
                        specs.Add(new ProductSpecification { ProductId = product.Id, Name = "Pin", Value = "Pin cả ngày" });
                    }
                     else if (product.Category.Code == "MS")
                    {
                        specs.Add(new ProductSpecification { ProductId = product.Id, Name = "Thời lượng pin", Value = "30 giờ" });
                        specs.Add(new ProductSpecification { ProductId = product.Id, Name = "Chống ồn", Value = "ANC chủ động" });
                        specs.Add(new ProductSpecification { ProductId = product.Id, Name = "Kết nối", Value = "Bluetooth 5.3" });
                    }
                    else
                    {
                        specs.Add(new ProductSpecification { ProductId = product.Id, Name = "Xuất xứ", Value = "Chính hãng" });
                        specs.Add(new ProductSpecification { ProductId = product.Id, Name = "Bảo hành", Value = "12 Tháng" });
                    }

                    await _context.ProductSpecifications.AddRangeAsync(specs);
                }
                
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Seeded specifications for products");
            }
            else
            {
                _logger.LogInformation("Product specifications already exist. Skipping seeding.");
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
                            UserName = user.UserName,
                            UserAvatar = "/uploads/users/avatar-20250521154845412-fd9c4c.jpg",
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
                            Url = "/uploads/products/product-20250519151510514-07077d.jpg"
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
                    ImageUrl = "/uploads/users/avatar-20250521154845412-fd9c4c.jpg",
                    Bio = "Với hơn 15 năm kinh nghiệm trong ngành bán lẻ, Minh lãnh đạo công ty chúng tôi với niềm đam mê và tầm nhìn."
                },
                new TeamMember
                {
                    Id = Guid.NewGuid(),
                    Name = "Trần Văn Hải",
                    Role = "Giám Đốc Sản Phẩm",
                    ImageUrl = "/uploads/users/avatar-20250521154845412-fd9c4c.jpg",
                    Bio = "Hải đảm bảo rằng mỗi sản phẩm chúng tôi cung cấp đều đáp ứng các tiêu chuẩn cao về chất lượng và thiết kế."
                },
                new TeamMember
                {
                    Id = Guid.NewGuid(),
                    Name = "Lê Thị Hương",
                    Role = "Trải Nghiệm Khách Hàng",
                    ImageUrl = "/uploads/users/avatar-20250521154845412-fd9c4c.jpg",
                    Bio = "Hương làm việc không mệt mỏi để đảm bảo rằng mỗi khách hàng đều có trải nghiệm mua sắm tuyệt vời."
                },
                new TeamMember
                {
                    Id = Guid.NewGuid(),
                    Name = "Phạm Minh Tuấn",
                    Role = "Quản Lý Vận Hành",
                    ImageUrl = "/uploads/users/avatar-20250521154845412-fd9c4c.jpg",
                    Bio = "Tuấn giám sát hậu cần của chúng tôi để đảm bảo giao hàng đúng hẹn và hoạt động hiệu quả."
                }
            },
                    Cta = new CtaSection
                    {
                        Title = "Sẵn Sàng Trải Nghiệm Sự Khác Biệt?",
                        Description = "Khám phá bộ sưu tập các sản phẩm chất lượng cao được thiết kế để nâng cao cuộc sống hàng ngày của bạn."
                    },
                    CreatedAt = DateTime.Now
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
                    CreatedAt = DateTime.Now
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

        private async Task SeedProductImagesAsync()
        {
            _logger.LogInformation("Seeding product images");

            if (!await _context.ProductImages.AnyAsync())
            {
                var products = await _context.Products.ToListAsync();

                foreach (var item in products)
                {
                    var productImages = new List<ProductImage>
                    {
                        new ProductImage
                        {
                            ProductId = item.Id,
                            Url = "/uploads/products/gallery/product1-20250717083845556-e03fab.jpg"
                        },
                        new ProductImage
                        {
                            ProductId = item.Id,
                            Url = "/uploads/products/gallery/product2-20250717083848887-55275e.jpg"
                        },
                        new ProductImage
                        {
                            ProductId = item.Id,
                            Url = "/uploads/products/gallery/product3-20250717083850098-ac1306.jpg"
                        },
                        new ProductImage
                        {
                            ProductId = item.Id,
                            Url = "/uploads/products/gallery/product4-20250717083851664-6584e6.jpg"
                        }

                    };


                    await _context.ProductImages.AddRangeAsync(productImages);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"Seeded {productImages.Count} product images");
                }
            }
            else
            {
                _logger.LogInformation("Products already exist. Skipping seeding.");
            }
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
                        ImageUrl = "/uploads/banners/neutral-minimalist-summer-fashion-sale-banner-20250804151856963-cb21e9.png",
                        ButtonText = "Mua ngay",
                        ButtonLink = "/products?category=fashion&sale=summer"
                    },
                    new Banner
                    {
                        Title = "Điện tử giảm sốc",
                        Description = "Giảm đến 30% cho các sản phẩm điện tử cao cấp",
                        ImageUrl = "/uploads/banners/gray-minimalist-fashion-big-sale-banner-20250804151827077-1f03c6.png",
                        ButtonText = "Khám phá",
                        ButtonLink = "/products?category=electronics&sale=true"
                    },
                    new Banner
                    {
                        Title = "Ưu đãi gia dụng",
                        Description = "Mua 1 tặng 1 cho tất cả sản phẩm gia dụng",
                        ImageUrl = "/uploads/banners/brown-modern-fashion-(banner-(landscape))-20250804151909078-70d252.png",
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

