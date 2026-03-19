using Ecommerce.Domain.Interfaces.Base;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Ecommerce.Infrastructure.Persistence.Repositories.Base
{
    public static class RepositoryExtensions
    {
        public static IQueryable<TEntity> IncludeMultiple<TEntity>(
            this IRepository<TEntity> repository,
            params Expression<Func<TEntity, object>>[] includes) where TEntity : class
        {
            var query = repository.AsQueryable();

            if (includes != null)
            {
                foreach (var include in includes)
                {
                    query = query.Include(include);
                }
            }

            return query;
        }

        private static IQueryable<TEntity> AsQueryable<TEntity>(
            this IRepository<TEntity> repository) where TEntity : class
        {
            if (repository is BaseRepository<TEntity> repoImpl)
            {
                return repoImpl.AsQueryable();
            }
            throw new InvalidOperationException("Repository must be of type Repository<TEntity> to use this extension");
        }
    }
}

