using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Ecommerce.Infrastructure
{
    /// <summary>
    /// Factory cho EF Core design-time tools (migrations, scaffolding).
    /// Bypass full DI container — chỉ cần connection string.
    /// </summary>
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseSqlServer(
                "Server=localhost;Database=ecommerce_db;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=True;",
                sqlOptions => sqlOptions
                    .MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)
                    .UseCompatibilityLevel(120));

            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}
