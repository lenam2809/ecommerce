using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class Product : BaseEntity
    {
        public Product()
        {
            // Constructor cho EF Core
            Images = new List<ProductImage>();
            Specifications = new List<ProductSpecification>();
            Reviews = new List<Review>();
            Attributes = new List<ProductAttribute>();
            VariantSkus = new List<ProductVariantSku>();
        }

        [Required]
        [StringLength(20)]
        public string Code { get; private set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string Name { get; private set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Sku { get; private set; } = string.Empty;
        
        public string Slug { get; private set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        [Range(0, double.MaxValue)]
        public decimal Price { get; private set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? SalePrice { get; private set; }

        [Range(0, 5)]
        public double Rating { get; private set; }

        [Range(0, int.MaxValue)]
        public int ReviewCount { get; private set; }

        [Url]
        public string Image { get; private set; } = string.Empty;

        public string Description { get; private set; } = string.Empty;

        [Range(0, int.MaxValue)]
        public int StockQuantity { get; private set; }

        public DateTime? PublishedDate { get; private set; }

        public bool IsActive { get; private set; } = true;

        /// <summary>
        /// Sản phẩm có biến thể (RAM/ROM/Màu) hay không.
        /// Nếu true, giá và tồn kho nằm ở ProductVariantSku.
        /// </summary>
        public bool HasVariants { get; private set; } = false;

        // Navigation properties
        public virtual ICollection<ProductImage> Images { get; private set; }
        public virtual ICollection<ProductSpecification> Specifications { get; private set; }
        public virtual ICollection<Review> Reviews { get; private set; }
        public virtual ProductVariants Variants { get; private set; } = null!;

        /// <summary>
        /// Thuộc tính sản phẩm (RAM, ROM, Màu sắc...) — chỉ dùng khi HasVariants = true
        /// </summary>
        public virtual ICollection<ProductAttribute> Attributes { get; private set; }

        /// <summary>
        /// Các SKU biến thể với giá và tồn kho riêng — chỉ dùng khi HasVariants = true
        /// </summary>
        public virtual ICollection<ProductVariantSku> VariantSkus { get; private set; }

        [ForeignKey(nameof(Category))]
        public Guid CategoryId { get; private set; }
        public virtual Category Category { get; private set; } = null!;

        [ForeignKey(nameof(Brand))]
        public Guid BrandId { get; private set; }
        public virtual Brand Brand { get; private set; } = null!;

        // Factory Method
        public static Product Create(
            string code,
            string name,
            string slug,
            string sku,
            decimal price,
            decimal? salePrice,
            string image,
            string description,
            int stockQuantity,
            Guid categoryId,
            Guid brandId,
            DateTime? publishedDate = null)
        {
            if (stockQuantity < 0) throw new ArgumentException("Stock quantity cannot be negative.");
            if (price < 0) throw new ArgumentException("Price cannot be negative.");
            if (salePrice.HasValue && salePrice.Value >= price) throw new ArgumentException("Sale price must be less than regular price.");

            return new Product
            {
                Code = code,
                Name = name,
                Sku = sku,
                Slug = slug,
                Price = price,
                SalePrice = salePrice,
                Image = image,
                Description = description,
                StockQuantity = stockQuantity,
                CategoryId = categoryId,
                BrandId = brandId,
                PublishedDate = publishedDate ?? DateTime.Now,
                IsActive = true,
                HasVariants = false,
                Images = new List<ProductImage>(),
                Attributes = new List<ProductAttribute>(),
                VariantSkus = new List<ProductVariantSku>(),
                Specifications = new List<ProductSpecification>(),
                Rating = 0,
                ReviewCount = 0
            };
        }

        public void UpdateInfo(
            string name,
            string slug,
            string description,
            string image,
            Guid categoryId,
            Guid brandId,
            bool isActive)
        {
            Name = name;
            Slug = slug;
            Description = description;
            Image = image;
            CategoryId = categoryId;
            BrandId = brandId;
            IsActive = isActive;
        }

        public void UpdatePrice(decimal price, decimal? salePrice)
        {
            if (price < 0) throw new ArgumentException("Price cannot be negative.");
            if (salePrice.HasValue && salePrice.Value < 0) throw new ArgumentException("Sale price cannot be negative.");
            if (salePrice.HasValue && salePrice.Value >= price) throw new ArgumentException("Sale price must be less than regular price.");

            Price = price;
            SalePrice = salePrice;
        }

        public void UpdateStock(int quantity)
        {
            if (quantity < 0) throw new ArgumentException("Stock quantity cannot be negative.");
            StockQuantity = quantity;
        }

        public void AdjustStock(int adjustment)
        {
            if (StockQuantity + adjustment < 0)
                throw new InvalidOperationException($"Insufficient stock for product {Name}. Current: {StockQuantity}, Adjustment: {adjustment}");
            
            StockQuantity += adjustment;
        }

        public void AddImage(string url)
        {
            if (!Images.Any(i => i.Url == url))
            {
                Images.Add(new ProductImage { Url = url, ProductId = this.Id });
            }
        }

        public void RemoveImage(string url)
        {
            var image = Images.FirstOrDefault(i => i.Url == url);
            if (image != null)
            {
                Images.Remove(image);
            }
        }

        public void RemoveImage(Guid id)
        {
            var image = Images.FirstOrDefault(i => i.Id == id);
            if (image != null)
            {
                Images.Remove(image);
            }
        }

        public void ClearImages()
        {
             Images.Clear();
        }

        public void AddSpecification(string name, string value)
        {
            Specifications.Add(new ProductSpecification { Name = name, Value = value, ProductId = this.Id });
        }
        
        public void ClearSpecifications()
        {
            Specifications.Clear();
        }

        public void SetVariants(List<string> colors, List<string> sizes)
        {
            if (Variants == null)
            {
                Variants = new ProductVariants { ProductId = this.Id };
            }

            Variants.Colors = colors.Select(c => new ProductColor { Color = c }).ToList();
            Variants.Sizes = sizes.Select(s => new ProductSize { Size = s }).ToList();
        }

        /// <summary>
        /// Đánh dấu sản phẩm có biến thể (giá/tồn kho nằm ở SKU level)
        /// </summary>
        public void EnableVariants()
        {
            HasVariants = true;
        }

        /// <summary>
        /// Thêm thuộc tính mới cho sản phẩm (ví dụ: RAM, ROM, Màu sắc)
        /// </summary>
        public ProductAttribute AddAttribute(string name, int displayOrder)
        {
            var attr = ProductAttribute.Create(this.Id, name, displayOrder);
            Attributes.Add(attr);
            return attr;
        }

        /// <summary>
        /// Thêm SKU biến thể mới
        /// </summary>
        public ProductVariantSku AddVariantSku(string sku, decimal price, decimal? salePrice, int stockQuantity, string? barcode = null)
        {
            var variantSku = ProductVariantSku.Create(this.Id, sku, price, salePrice, stockQuantity, barcode);
            VariantSkus.Add(variantSku);
            return variantSku;
        }

        public void ClearAttributes()
        {
            Attributes.Clear();
        }

        public void ClearVariantSkus()
        {
            VariantSkus.Clear();
        }

        /// <summary>
        /// Tính tổng tồn kho từ tất cả SKU (cho sản phẩm có variants)
        /// </summary>
        public int GetTotalStock()
        {
            if (!HasVariants) return StockQuantity;
            return VariantSkus.Where(s => s.IsActive).Sum(s => s.StockQuantity);
        }

        /// <summary>
        /// Lấy khoảng giá (min-max) từ tất cả SKU active
        /// </summary>
        public (decimal MinPrice, decimal MaxPrice) GetPriceRange()
        {
            if (!HasVariants) return (SalePrice ?? Price, Price);
            var activeSkus = VariantSkus.Where(s => s.IsActive).ToList();
            if (!activeSkus.Any()) return (Price, Price);
            return (activeSkus.Min(s => s.EffectivePrice), activeSkus.Max(s => s.Price));
        }

        public void UpdateRating(double rating, int reviewCount)
        {
            Rating = rating;
            ReviewCount = reviewCount;
        }
    }
}

