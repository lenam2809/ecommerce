using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class CartConfiguration : IEntityTypeConfiguration<Cart>
    {
        public void Configure(EntityTypeBuilder<Cart> builder)
        {
            builder.ToTable("Carts");

            builder.Property(c => c.Discount)
            .HasPrecision(18, 2);

            builder.Property(c => c.ShippingCost)
            .HasPrecision(18, 2);

            builder.Property(c => c.Subtotal)
            .HasPrecision(18, 2);

            builder.Property(c => c.Total)
                .HasPrecision(18, 2);

            // Cấu hình AnonymousId cho guest cart
            builder.Property(c => c.AnonymousId)
                .HasMaxLength(450)
                .IsRequired(false);

            builder.HasIndex(c => c.AnonymousId)
                .IsUnique(false);

            // Cấu hình quan hệ với User (nullable cho guest cart)
            builder.HasOne(c => c.ApplicationUser)
                   .WithMany()
                   .HasForeignKey(c => c.ApplicationUserId)
                   .OnDelete(DeleteBehavior.Cascade)
                   .IsRequired(false);

            // Cấu hình quan hệ với CartItem
            // CRITICAL: Configure EF Core to populate the private _cartItems backing field
            // Without this, UpdateQuantity and other methods that modify _cartItems won't work!
            builder.HasMany(c => c.CartItems)
                   .WithOne(ci => ci.Cart)
                   .HasForeignKey(ci => ci.CartId)
                   .OnDelete(DeleteBehavior.Cascade);
            
            // Configure the backing field so EF Core populates it when loading from database
            builder.Navigation(c => c.CartItems)
                   .UsePropertyAccessMode(PropertyAccessMode.Field)
                   .HasField("_cartItems");
        }
    }
}

