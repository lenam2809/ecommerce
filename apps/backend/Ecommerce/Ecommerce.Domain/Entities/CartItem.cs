using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class CartItem
    {
        // Constructor for EF Core
        private CartItem() { }

        public CartItem(Guid cartId, Product product, int quantity, string? color, string? size,
            Guid? productVariantSkuId = null)
        {
            CartId = cartId;
            ProductId = product.Id;
            Product = product;
            Quantity = quantity;
            Color = color;
            Size = size;
            ProductVariantSkuId = productVariantSkuId;
            DateAdded = DateTime.Now;

            if (!ValidateQuantity(product))
            {
                throw new Exception($"Không đủ hàng trong kho. Kho còn: {product.StockQuantity}");
            }
        }

        [ForeignKey(nameof(Cart))]
        public Guid CartId { get; private set; }
        
        [ForeignKey(nameof(Product))]
        public Guid ProductId { get; private set; }
        
        [Range(1, 1000, ErrorMessage = "Số lượng sản phẩm phải từ 1-1000")]
        public int Quantity { get; set; }
        
        public string? Color { get; private set; }
        public string? Size { get; private set; }
        public DateTime DateAdded { get; private set; } = DateTime.Now;

        /// <summary>
        /// Link tới SKU biến thể cụ thể (nullable cho sản phẩm không có variant)
        /// </summary>
        [ForeignKey(nameof(ProductVariantSku))]
        public Guid? ProductVariantSkuId { get; private set; }

        public virtual Cart Cart { get; private set; } = null!;
        public virtual Product Product { get; private set; } = null!;
        public virtual ProductVariantSku? ProductVariantSku { get; private set; }

        [NotMapped]
        public decimal TotalPrice => (Product?.SalePrice ?? Product?.Price ?? 0) * Quantity;

        public void AddQuantity(int quantity)
        {
            Quantity += quantity;
        }

        public void UpdateQuantity(int quantity)
        {
            Quantity = quantity;
        }

        // Validation trước khi thêm vào giỏ hàng
        public bool ValidateQuantity(Product product)
        {
            return Quantity <= product.StockQuantity && Quantity > 0;
        }
    }
}

