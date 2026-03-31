using Ecommerce.Domain.Interfaces.Base;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Ecommerce.Infrastructure.Persistence.Repositories.Base
{
    public class BaseRepository<T> : IRepository<T> where T : class
    {
        protected readonly ApplicationDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public BaseRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _dbSet = _context.Set<T>();
        }

        public IQueryable<T> GetQueryable(bool tracking = false)
        {
            return tracking ? _dbSet.AsQueryable() : _dbSet.AsNoTracking();
        }

        public async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _dbSet.FindAsync(id, cancellationToken);
        }


        public async Task<T?> GetByIdWithIncludeAsync(Guid id, Expression<Func<IQueryable<T>, IQueryable<T>>>? include = null, CancellationToken cancellationToken = default)
        {
            var query = _dbSet.AsQueryable();

            if (include != null)
            {
                query = include.Compile()(query);
            }

            var entity = await query.FirstOrDefaultAsync(e => EF.Property<Guid>(e, "Id") == id, cancellationToken);
            return entity;
        }

        public async Task<T> GetByIdWithIncludeAsync(
            Guid id,
            bool splitQuery = false,
            params Expression<Func<T, object>>[] includes)
        {
            var query = _dbSet.AsQueryable();

            if (splitQuery)
            {
                query = query.AsSplitQuery();
            }

            foreach (var include in includes)
            {
                query = query.Include(include);
            }

            return await query.FirstOrDefaultAsync(e =>
                    EF.Property<Guid>(e, "Id").Equals(id))
                    ?? throw new KeyNotFoundException($"Entity with ID {id} not found");
        }


        public async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet.AsNoTracking().ToListAsync(cancellationToken);
        }

        public async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
        {
            await _dbSet.AddAsync(entity, cancellationToken);
            return entity;
        }

        public void Update(T entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
        }

        public void Delete(T entity)
        {
            _dbSet.Remove(entity);
        }

        // Triển khai các phương thức mới
        public async Task<IEnumerable<T>> AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default)
        {
            await _dbSet.AddRangeAsync(entities, cancellationToken);
            return entities;
        }

        public void UpdateRange(IEnumerable<T> entities)
        {
            foreach (var entity in entities)
            {
                _context.Entry(entity).State = EntityState.Modified;
            }
        }

        public void DeleteRange(IEnumerable<T> entities)
        {
            _dbSet.RemoveRange(entities);
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<bool> AnyAsync(Expression<Func<T, bool>> expression, CancellationToken cancellationToken = default)
        {
            return await _dbSet.AnyAsync(expression, cancellationToken);
        }

        public async Task<int> CountAsync(Expression<Func<T, bool>>? expression = null, CancellationToken cancellationToken = default)
        {
            if (expression == null)
            {
                return await _dbSet.CountAsync(cancellationToken);
            }
            return await _dbSet.CountAsync(expression, cancellationToken);
        }

        /// <summary>
        /// Tính tổng giá trị của một trường thoả mãn điều kiện.
        /// </summary>
        public async Task<decimal> SumAsync(Expression<Func<T, bool>>? expression = null, Expression<Func<T, decimal>>? selector = null, CancellationToken cancellationToken = default)
        {
            if (selector == null)
                throw new ArgumentNullException(nameof(selector), "Selector must not be null.");

            if (expression == null)
            {
                return await _dbSet.SumAsync(selector, cancellationToken);
            }

            return await _dbSet.Where(expression).SumAsync(selector, cancellationToken);
        }



        public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> expression, CancellationToken cancellationToken = default)
        {
            return await _dbSet.FirstOrDefaultAsync(expression, cancellationToken);
        }

        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> expression, CancellationToken cancellationToken = default)
        {
            return await _dbSet.Where(expression).ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<T>> FindAsync(ISpecification<T> spec, CancellationToken cancellationToken = default)
        {
            return await ApplySpecification(spec).ToListAsync(cancellationToken);
        }

        public async Task<PaginatedResult<T>> GetPaginatedAsync(
        Expression<Func<T, bool>>? filter = null,
        Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
        int pageIndex = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default,
        Func<IQueryable<T>, IQueryable<T>>? includeFunc = null)
        {
            IQueryable<T> query = _dbSet.AsNoTracking();

            // Apply includeFunc nếu có
            if (includeFunc != null)
            {
                query = includeFunc(query);
            }

            if (filter != null)
            {
                query = query.Where(filter);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            var items = await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return new PaginatedResult<T>
            {
                PageIndex = pageIndex,
                PageSize = pageSize,
                TotalCount = totalCount,
                Items = items
            };
        }

        public async Task<PaginatedResult<TResult>> GetPaginatedProjectionAsync<TResult>(
            Expression<Func<T, bool>>? filter = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            Expression<Func<T, TResult>>? selector = null,
            int pageIndex = 1,
            int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(selector);

            IQueryable<T> query = _dbSet.AsNoTracking();

            if (filter != null)
            {
                query = query.Where(filter);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            var items = await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(selector)
                .ToListAsync(cancellationToken);

            return new PaginatedResult<TResult>
            {
                PageIndex = pageIndex,
                PageSize = pageSize,
                TotalCount = totalCount,
                Items = items
            };
        }

        public async Task<IEnumerable<T>> FilterAsync(
            Expression<Func<T, bool>>? filter = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            CancellationToken cancellationToken = default)
        {
            IQueryable<T> query = _dbSet.AsNoTracking();

            if (filter != null)
            {
                query = query.Where(filter);
            }

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            return await query.ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<TResult>> GetProjectionAsync<TResult>(
            Expression<Func<T, bool>>? filter = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            Expression<Func<T, TResult>>? selector = null,
            CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(selector);

            IQueryable<T> query = _dbSet.AsNoTracking();

            if (filter != null)
            {
                query = query.Where(filter);
            }

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            return await query.Select(selector).ToListAsync(cancellationToken);
        }

        // SECURITY: sql phải dùng placeholder {0},{1}... — KHÔNG concat user input vào sql string
        public async Task<IEnumerable<TResult>> ExecuteQueryAsync<TResult>(string sql, object[]? parameters = null, CancellationToken cancellationToken = default)
        {
            var safeParams = parameters ?? Array.Empty<object>();
            return await _context.Database.SqlQueryRaw<TResult>(sql, safeParams).ToListAsync(cancellationToken);
        }

        // SECURITY: sql phải dùng placeholder {0},{1}... — KHÔNG concat user input vào sql string
        public async Task<int> ExecuteCommandAsync(string sql, object[]? parameters = null, CancellationToken cancellationToken = default)
        {
            var safeParams = parameters ?? Array.Empty<object>();
            return await _context.Database.ExecuteSqlRawAsync(sql, safeParams, cancellationToken);
        }

        private IQueryable<T> ApplySpecification(ISpecification<T> spec)
        {
            var query = GetQueryable();

            if (spec.Criteria != null)
            {
                query = query.Where(spec.Criteria);
            }

            query = spec.Includes.Aggregate(query, (current, include) => current.Include(include));

            if (spec.OrderBy != null)
            {
                query = query.OrderBy(spec.OrderBy);
            }

            if (spec.OrderByDescending != null)
            {
                query = query.OrderByDescending(spec.OrderByDescending);
            }

            if (spec.IsPagingEnabled)
            {
                query = query.Skip(spec.Skip).Take(spec.Take);
            }

            return query;
        }
        public async Task<IEnumerable<T>> GetAllWithIncludeAsync(
            Expression<Func<IQueryable<T>, IQueryable<T>>>? include = null,
            CancellationToken cancellationToken = default)
        {
            var query = _dbSet.AsQueryable();

            if (include != null)
            {
                query = include.Compile()(query);
            }

            var result = await query.ToListAsync(cancellationToken);
            return result;
        }


    }
}

