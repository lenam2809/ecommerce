> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 10/05/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/docker-compose-services/03-elasticsearch.md`](docker-compose-services/03-elasticsearch.md) và [`docs/architecture-backend.md`](architecture-backend.md).

# Elasticsearch Product Search

ShopViet keeps SQL Server/PostgreSQL as the source of truth and indexes active products into Elasticsearch for catalog search.

## Development

Start the stack from the repository root:

```bash
cd docker-compose
docker compose up -d elasticsearch
```

The compose file builds `docker-compose/elasticsearch.Dockerfile`, which installs the Elasticsearch ICU analysis plugin. The API uses:

```json
"Elasticsearch": {
  "UseElasticsearch": true,
  "Uri": "http://localhost:9200",
  "DefaultIndex": "products",
  "Username": "",
  "Password": ""
}
```

When running the API in Docker, the URI is `http://elasticsearch:9200`.

## Analyzer And Mapping

The `products` index uses a `vietnamese_analyzer` custom analyzer:

- tokenizer: `icu_tokenizer`
- filters: `icu_folding`, `lowercase`

Searchable text fields include `name`, `description`, `tags`, `categoryName`, and `brandName`. Exact filters use `categoryId`, `brandId`, `price`, and `isActive`.

## Synchronization

Product create/update/delete commands publish MediatR notifications. Handlers update or delete the corresponding Elasticsearch document after the SQL transaction completes.

`ElasticsearchInitialSyncService` runs a startup sync when the index is empty and a daily full reindex at `Elasticsearch:DailyReindexHourUtc` when enabled. The sync indexes active products in batches.

## API

Public endpoint:

```http
GET /api/search/products?q=iphone&categoryId={guid}&brandId={guid}&minPrice=100&maxPrice=1000&sortBy=relevance&pageNumber=1&pageSize=12
```

Supported sort values:

- `relevance`
- `name`
- `price`, `price_asc`, `price_desc`
- `newest`, `createdat`
- `rating`

If Elasticsearch is disabled or unavailable, the endpoint returns `503 Service Unavailable`. Existing product endpoints are unchanged.

## Production Notes

Do not expose Elasticsearch directly to the public internet. Use authentication, private networking, snapshots, and a replica count appropriate for the cluster size.
