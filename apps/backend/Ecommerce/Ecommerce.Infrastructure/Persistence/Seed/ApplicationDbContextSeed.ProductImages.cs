using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Seed
{
    public partial class ApplicationDbContextSeed
    {
        private async Task SeedReplacementProductImagesAsync()
        {
            const string legacyMainImage = "products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg";
            const string legacyGalleryImage = "products/gallery/apple_iphone_15_pro_256gb-20260323132840022-1aa2cb.jpg";
            const string fold7Slug = "samsung-galaxy-z-fold7-12gb-256gb";

            string[] slugs =
            [
                "dien-thoai-iphone-16-pro-max-256gb",
                "honor-magic-v5-16gb-512gb",
                "honor-x8d-8gb-128gb",
                "honor-x9d-12gb-512gb",
                "iphone-15-128gb-chinh-hang-vna",
                "iphone-16e-128gb-chinh-hang-vna",
                "iphone-17-256gb-chinh-hang",
                "iphone-17-pro-256gb-chinh-hang",
                "iphone-17-pro-max-256gb-chinh-hang",
                "iphone-17e-256gb-chinh-hang",
                "iphone-air-256gb-chinh-hang",
                "nothing-phone-2a-plus-5g-12gb-256gb",
                "oppo-reno15-5g-12gb-256gb",
                "oppo-reno15-f-5g-8gb-256gb",
                "samsung-galaxy-a07-4gb-128gb",
                "samsung-galaxy-s25-ultra-12gb-256gb",
                "samsung-galaxy-s26-12gb-256gb",
                "samsung-galaxy-s26-ultra-12gb-256gb",
                "samsung-galaxy-s26-ultra-12gb-512gb",
                "samsung-galaxy-z-flip7-12gb-256gb",
                "samsung-galaxy-z-fold7-12gb-256gb",
                "tecno-pova-7-8gb-128gb",
                "tecno-pova-7-8gb-256gb",
                "xiaomi-poco-f8-pro-5g-12gb-256gb",
                "xiaomi-redmi-note-14-pro-plus-5g-8gb-256gb",
            ];

            var products = await _context.Products
                .Where(product => product.Image == legacyMainImage && slugs.Contains(product.Slug))
                .Include(product => product.Images)
                .ToListAsync();

            foreach (var product in products)
            {
                var isFold7 = product.Slug == fold7Slug;
                var folder = isFold7 ? "galaxy-z-fold7-blue-shadow" : product.Slug;
                var path = $"products/{folder}";

                _context.Entry(product).Property(item => item.Image).CurrentValue = $"{path}/01-main.png";

                var placeholderImages = product.Images.Where(image => image.Url == legacyGalleryImage).ToList();
                _context.ProductImages.RemoveRange(placeholderImages);

                product.AddImage($"{path}/{(isFold7 ? "02-unfolded-front.png" : "02-front.png")}");
                product.AddImage($"{path}/{(isFold7 ? "03-folded-back.png" : "03-back.png")}");
                product.AddImage($"{path}/{(isFold7 ? "04-hinge-side.png" : "04-side.png")}");
                product.AddImage($"{path}/05-camera-close-up.png");
            }

            await _context.SaveChangesAsync();
        }
    }
}
