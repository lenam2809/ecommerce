> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 10/05/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/architecture-backend.md`](architecture-backend.md) và [`docs/docker-compose-services/02-redis.md`](docker-compose-services/02-redis.md).

# ShopViet Caching Strategy

Redis is required for distributed query caching and guest carts.

## Query Caching

MediatR queries opt in with `[Cacheable]`, `[Cache]`, or `ICacheableQuery`. The caching pipeline builds deterministic keys:

```text
query:{normalized-prefix}:{sha256-of-request-json}
```

Redis failures do not break requests. The API logs the cache error and falls back to the query handler and database.

Default TTLs are configured in `CacheSettings`:

- Products: 10 minutes
- Categories: 30 minutes
- Brands: 30 minutes
- System/config data: 60 minutes
- User-specific reads: 2 minutes

## Invalidation

The pipeline tracks query keys by Redis tag set. Mutations call `ICacheInvalidationService`:

- Product changes clear product list/detail/option caches.
- Category changes clear category caches and product caches.
- Brand changes clear brand caches and product caches.

Manual flush examples:

```bash
redis-cli --scan --pattern 'ecommerce:*' | xargs redis-cli del
redis-cli del cachetag:Products_All cachetag:Product_Detail
```

## Guest Carts

Guest carts are stored in Redis under `cart:guest:{sessionId}` with a 7-day TTL. Authenticated carts remain in SQL. On login, Redis guest cart items are merged into the user's SQL cart and the Redis key is deleted. Legacy SQL guest carts remain as a safe fallback during migration.

## React Query

Client-side cache settings reduce repeat API calls:

- Product lists: 30 seconds stale time, 5 minutes garbage collection
- Product details: 1 minute stale time, 5 minutes garbage collection
- Categories and brands: 5 minutes stale time, 10 minutes garbage collection
- Product cards prefetch detail data on hover/focus
