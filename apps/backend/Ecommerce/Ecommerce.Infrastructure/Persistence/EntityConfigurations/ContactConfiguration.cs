using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class ContactConfiguration : IEntityTypeConfiguration<Contact>
    {
        public void Configure(EntityTypeBuilder<Contact> builder)
        {
            builder.ToTable("Contacts");

            // Configure owned entities
            builder.OwnsOne(c => c.Phone, phone =>
            {
                phone.Property(p => p.Value).HasColumnName("PhoneNumber").HasMaxLength(50);
                phone.Property(p => p.Description).HasColumnName("PhoneDescription").HasMaxLength(200);
            });

            builder.OwnsOne(c => c.Email, email =>
            {
                email.Property(e => e.Value).HasColumnName("EmailAddress").HasMaxLength(100);
                email.Property(e => e.Description).HasColumnName("EmailDescription").HasMaxLength(200);
            });

            builder.OwnsOne(c => c.Office, office =>
            {
                office.Property(o => o.Value).HasColumnName("OfficeAddress").HasMaxLength(500);
                office.Property(o => o.Description).HasColumnName("OfficeDescription").HasMaxLength(200);
            });

            // Configure collections of owned entities
            builder.OwnsMany(c => c.SocialLinks, social =>
            {
                social.WithOwner().HasForeignKey("ContactId");
                social.Property(s => s.Name).HasMaxLength(50);
                social.Property(s => s.Url).HasMaxLength(500);
                social.ToTable("ContactSocialLinks");
            });

            builder.OwnsMany(c => c.Faqs, faq =>
            {
                faq.WithOwner().HasForeignKey("ContactId");
                faq.Property(f => f.Question).HasMaxLength(500);
                faq.Property(f => f.Answer).HasMaxLength(2000);
                faq.ToTable("ContactFaqs");
            });

            // Configure timestamps
            builder.Property(c => c.CreatedAt)
                   .IsRequired()
                   .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(c => c.UpdatedAt)
                   .IsRequired(false);

            // Configure indexes
            builder.HasIndex(c => c.CreatedAt);
        }
    }

}

