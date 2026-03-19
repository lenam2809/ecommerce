using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.EntityConfigurations
{
    public class AboutConfiguration : IEntityTypeConfiguration<About>
    {
        public void Configure(EntityTypeBuilder<About> builder)
        {
            builder.ToTable("Abouts");

            // Configure owned entities
            builder.OwnsOne(a => a.Hero, hero =>
            {
                hero.Property(h => h.Title).HasColumnName("HeroTitle").HasMaxLength(200);
                hero.Property(h => h.Description).HasColumnName("HeroDescription").HasMaxLength(1000);
            });

            builder.OwnsOne(a => a.History, history =>
            {
                history.Property(h => h.Title).HasColumnName("HistoryTitle").HasMaxLength(200);

                // Configure the paragraphs collection
                history.OwnsMany(h => h.Paragraphs, p =>
                {
                    p.ToTable("AboutHistoryParagraphs");
                    p.Property(x => x.Content).HasMaxLength(2000);
                });
            });

            builder.OwnsOne(a => a.Cta, cta =>
            {
                cta.Property(c => c.Title).HasColumnName("CtaTitle").HasMaxLength(200);
                cta.Property(c => c.Description).HasColumnName("CtaDescription").HasMaxLength(1000);
            });

            // Configure collections of owned entities
            builder.OwnsMany(a => a.Values, value =>
            {
                value.WithOwner().HasForeignKey("AboutId");
                value.Property(v => v.Title).HasMaxLength(200);
                value.Property(v => v.Description).HasMaxLength(1000);
                value.ToTable("AboutValues");
            });

            builder.OwnsMany(a => a.Team, team =>
            {
                team.WithOwner().HasForeignKey("AboutId");
                team.Property(t => t.Name).HasMaxLength(100);
                team.Property(t => t.Role).HasMaxLength(100);
                team.Property(t => t.ImageUrl).HasMaxLength(500);
                team.Property(t => t.Bio).HasMaxLength(1000);
                team.ToTable("AboutTeamMembers");
            });

            // Configure indexes
            builder.HasIndex(a => a.CreatedAt);
        }
    }

}

