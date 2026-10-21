using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    // Cấu hình cho Order
    public class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.ToTable("Orders");

            // Validation cho các trường
            builder.Property(o => o.TotalAmount)
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            builder.Property(o => o.Subtotal)
                   .HasColumnType("decimal(18,2)")
                   .HasDefaultValue(0);

            builder.Property(o => o.ShippingCost)
                   .HasColumnType("decimal(18,2)")
                   .HasDefaultValue(0);

            builder.Property(o => o.DiscountAmount)
                   .HasColumnType("decimal(18,2)")
                   .HasDefaultValue(0);

            builder.Property(o => o.DeliveryType)
                   .HasDefaultValue(EDeliveryType.HomeDelivery)
                   .HasSentinel((EDeliveryType)0);

            builder.Property(o => o.DepositRequired)
                   .HasColumnType("decimal(18,2)")
                   .HasDefaultValue(0);

            builder.Property(o => o.DepositStatus)
                   .HasDefaultValue(EDepositStatus.None);

            builder.Property(o => o.PickupShowroomId)
                   .IsRequired(false);

            builder.Property(o => o.DepositAmount)
                   .HasColumnType("decimal(18,2)")
                   .HasDefaultValue(0);

            builder.Property(o => o.RemainingAmount)
                   .HasColumnType("decimal(18,2)")
                   .HasDefaultValue(0);

            builder.Property(o => o.ShippingAddress)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(o => o.Phone)
                   .HasMaxLength(20);

            builder.Property(o => o.Email)
                   .HasMaxLength(100);

            builder.Property(o => o.GuestEmail)
                   .HasMaxLength(200);

            builder.Property(o => o.GuestName)
                   .HasMaxLength(100);

            builder.Property(o => o.GuestId)
                   .HasMaxLength(64);

            builder.Property(o => o.DeliveryMethod)
                   .IsRequired()
                   .HasMaxLength(50)
                   .HasDefaultValue("StandardDelivery");

            builder.Property(o => o.PaymentMethod)
                   .IsRequired()
                   .HasMaxLength(50)
                   .HasDefaultValue("COD");

            builder.Property(o => o.PaymentStatus)
                   .IsRequired()
                   .HasMaxLength(50)
                   .HasDefaultValue("Pending");

            builder.Property(o => o.TransactionId)
                   .HasMaxLength(100);

            builder.Property(o => o.CarrierName)
                   .HasMaxLength(100);

            builder.Property(o => o.TrackingNumber)
                   .HasMaxLength(100);

            builder.Property(o => o.DriverName)
                   .HasMaxLength(100);

            builder.Property(o => o.DriverPhone)
                   .HasMaxLength(30);

            builder.Property(o => o.RecipientName)
                   .HasMaxLength(100);

            // Owned Value Object OrderInvoice
            builder.OwnsOne(o => o.Invoice, invoiceBuilder =>
            {
                invoiceBuilder.Property(i => i.RequireInvoice)
                              .HasColumnName("RequireInvoice")
                              .HasDefaultValue(false);

                invoiceBuilder.Property(i => i.TaxCode)
                              .HasColumnName("TaxCode")
                              .HasMaxLength(50);

                invoiceBuilder.Property(i => i.CompanyName)
                              .HasColumnName("CompanyName")
                              .HasMaxLength(255);

                invoiceBuilder.Property(i => i.CompanyAddress)
                              .HasColumnName("CompanyAddress")
                              .HasMaxLength(500);

                invoiceBuilder.Property(i => i.InvoiceEmail)
                              .HasColumnName("InvoiceEmail")
                              .HasMaxLength(150);

                invoiceBuilder.Property(i => i.InvoiceFileUrl)
                              .HasColumnName("InvoiceFileUrl")
                              .HasMaxLength(500);
            });

            // Ignore convenience properties that delegate to Invoice
            builder.Ignore(o => o.RequireInvoice);
            builder.Ignore(o => o.TaxCode);
            builder.Ignore(o => o.CompanyName);
            builder.Ignore(o => o.CompanyAddress);
            builder.Ignore(o => o.InvoiceEmail);

            // Cấu hình quan hệ
            builder.HasOne(o => o.ApplicationUser)
                   .WithMany(u => u.Orders)
                   .HasForeignKey(o => o.ApplicationUserId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(o => o.Showroom)
                   .WithMany(s => s.Orders)
                   .HasForeignKey(o => o.ShowroomId)
                   .OnDelete(DeleteBehavior.Restrict)
                   .IsRequired(false);

            builder.HasOne(o => o.PickupShowroom)
                   .WithMany()
                   .HasForeignKey(o => o.PickupShowroomId)
                   .OnDelete(DeleteBehavior.Restrict)
                   .IsRequired(false);

            // Cấu hình quan hệ với OrderItem
            builder.HasMany(o => o.OrderItems)
                   .WithOne(oi => oi.Order)
                   .HasForeignKey(oi => oi.OrderId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Index hóa
            builder.HasIndex(o => o.Code).IsUnique();
            builder.HasIndex(o => new { o.ApplicationUserId, o.OrderDate });
            builder.HasIndex(o => new { o.GuestId, o.OrderDate });
            builder.HasIndex(o => o.ShowroomId);
            builder.HasIndex(o => o.PickupShowroomId);
            builder.HasIndex(o => o.DeliveryType);
        }
    }
}
