Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# Service elasticsearch

Quy ước lệnh: mọi lệnh `docker compose ...` trong tài liệu này phải chạy từ thư mục `docker-compose`. Nếu đang ở root repository, chạy:

```bash
cd docker-compose
```

## 1. Vai trò

`elasticsearch` là search service của hệ thống e-commerce khi chạy bằng Docker Compose.

Trong `docker-compose.yml`, backend đang bật Elasticsearch qua các biến:

```yaml
- Elasticsearch__UseElasticsearch=true
- Elasticsearch__Uri=http://elasticsearch:9200
- Elasticsearch__DefaultIndex=${ELASTICSEARCH_DEFAULT_INDEX:-products}
- Elasticsearch__RunStartupReindex=true
- Elasticsearch__RunDailyReindex=true
```

Dựa trên cấu hình này, Elasticsearch được dùng cho:

- Tìm kiếm sản phẩm.
- Lưu index dữ liệu sản phẩm, với index mặc định là `products` nếu không override `ELASTICSEARCH_DEFAULT_INDEX`.
- Hỗ trợ luồng search/filter nếu backend đang dùng các cấu hình Elasticsearch trên. Chi tiết endpoint và logic filter cụ thể cần kiểm tra thêm trong code backend.

## 2. Cấu hình trong docker-compose.yml

Cấu hình service `elasticsearch` trong `docker-compose/docker-compose.yml`:

- `build context`:

  ```yaml
  context: .
  ```

  Build context là thư mục `docker-compose`.

- `dockerfile`:

  ```yaml
  dockerfile: elasticsearch.Dockerfile
  ```

  Compose build image Elasticsearch từ file `docker-compose/elasticsearch.Dockerfile`.

- `image`: `ecommerce-elasticsearch-icu:8.16.3`

  Tên image custom được Compose gán sau khi build. Dockerfile hiện dùng base image Elasticsearch `8.16.3` và cài plugin `analysis-icu`.

- `container_name`: `ecommerce-elasticsearch`

  Tên container cố định khi Docker Compose tạo container cho service này.

- `restart policy`: `unless-stopped`

  Container sẽ tự khởi động lại khi bị dừng do lỗi hoặc khi Docker daemon khởi động lại, trừ khi developer chủ động dừng container.

- `environment`:

  ```yaml
  - xpack.security.enabled=false
  - discovery.type=single-node
  - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
  ```

- `ports`:

  ```yaml
  - "9200:9200"
  ```

  Port host `9200` được map vào port `9200` trong container. Compose không khai báo biến môi trường để đổi port này.

- `volumes`:

  ```yaml
  - elasticsearch_data:/usr/share/elasticsearch/data
  ```

  Dữ liệu index Elasticsearch được lưu trong named volume `elasticsearch_data`.

- `networks`:

  ```yaml
  - ecommerce-network
  ```

  Service nằm trong network nội bộ `ecommerce-network`, cho phép backend gọi đến bằng URL nội bộ `http://elasticsearch:9200`.

- `healthcheck`:

  ```yaml
  test: ["CMD-SHELL", "curl -s http://localhost:9200/_cluster/health | grep -q '\"status\":\"green\"\\|\"status\":\"yellow\"'"]
  interval: 10s
  timeout: 5s
  retries: 10
  ```

  Docker kiểm tra Elasticsearch bằng cách gọi `http://localhost:9200/_cluster/health` bên trong container. Healthcheck chỉ pass khi cluster trả về status `green` hoặc `yellow`.

## 3. Cấu hình quan trọng

- `xpack.security.enabled=false`

  Tắt security layer của Elasticsearch trong container này. Vì vậy Elasticsearch local có thể truy cập qua HTTP mà không cần username/password. Cấu hình này phù hợp cho môi trường phát triển nội bộ; khi deploy thật cần kiểm tra lại yêu cầu bảo mật.

- `discovery.type=single-node`

  Chạy Elasticsearch ở chế độ một node. Cấu hình này tránh yêu cầu discovery cluster nhiều node và phù hợp với Docker Compose local.

- `ES_JAVA_OPTS=-Xms512m -Xmx512m`

  Giới hạn heap JVM của Elasticsearch: heap khởi tạo `512m`, heap tối đa `512m`. Nếu máy thiếu RAM hoặc workload search/index lớn hơn, Elasticsearch có thể khởi động chậm hoặc bị dừng; cần kiểm tra log container.

- Port `9200`

  Compose map:

  ```yaml
  - "9200:9200"
  ```

  Vì không dùng biến môi trường cho port này, nếu port `9200` trên máy host bị chiếm thì phải sửa trực tiếp mapping trong `docker-compose.yml` hoặc dừng tiến trình đang chiếm port.

## 4. Cách khởi động riêng Elasticsearch

Chạy từ thư mục gốc dự án:

```bash
cd docker-compose
docker compose up -d elasticsearch
```

Nếu image `ecommerce-elasticsearch-icu:8.16.3` chưa có trên máy, Compose sẽ build từ `elasticsearch.Dockerfile`.

## 5. Cách kiểm tra Elasticsearch

Chạy từ thư mục `docker-compose`:

```bash
docker compose ps elasticsearch
docker compose logs -f elasticsearch
curl http://localhost:9200
curl http://localhost:9200/_cluster/health
```

Khi container hoạt động bình thường:

- `docker compose ps elasticsearch` nên hiển thị container `ecommerce-elasticsearch` ở trạng thái `healthy`.
- `curl http://localhost:9200` nên trả về thông tin node/cluster Elasticsearch.
- `curl http://localhost:9200/_cluster/health` trả về JSON có trường `status`.

Ý nghĩa status:

- `green`: Cluster hoạt động đầy đủ, các shard cần thiết đã được phân bổ.
- `yellow`: Cluster vẫn có thể phục vụ dữ liệu chính, nhưng chưa phân bổ đầy đủ replica. Với môi trường single-node, trạng thái `yellow` có thể xuất hiện nếu index có replica. Healthcheck trong Compose chấp nhận cả `green` và `yellow`.
- `red`: Có primary shard chưa sẵn sàng. Healthcheck trong Compose không chấp nhận `red`; backend search/index có thể lỗi hoặc trả dữ liệu không đầy đủ.

## 6. Cách backend kết nối Elasticsearch

Khi `backend` chạy trong Docker Compose network, backend gọi Elasticsearch bằng URL nội bộ:

```text
http://elasticsearch:9200
```

Không dùng `localhost:9200` từ container backend. Trong container backend, `localhost` là chính container backend, không phải container Elasticsearch.

Trong `docker-compose.yml`, backend đang được cấu hình:

```yaml
- Elasticsearch__UseElasticsearch=true
- Elasticsearch__Uri=http://elasticsearch:9200
- Elasticsearch__DefaultIndex=${ELASTICSEARCH_DEFAULT_INDEX:-products}
- Elasticsearch__Username=${ELASTICSEARCH_USERNAME:-}
- Elasticsearch__Password=${ELASTICSEARCH_PASSWORD:-}
- Elasticsearch__RunStartupReindex=true
- Elasticsearch__RunDailyReindex=true
```

Vì service `elasticsearch` đang tắt security bằng `xpack.security.enabled=false`, username/password mặc định trong Compose là rỗng.

## 7. Dữ liệu index lưu ở đâu

Dữ liệu index Elasticsearch được lưu trong named volume:

```text
elasticsearch_data
```

Volume này được mount vào thư mục dữ liệu của Elasticsearch trong container:

```text
/usr/share/elasticsearch/data
```

Cấu hình trong Compose:

```yaml
volumes:
  - elasticsearch_data:/usr/share/elasticsearch/data
```

Nhờ volume này, index có thể còn sau khi xóa container bằng:

```bash
docker compose down
```

Cảnh báo: lệnh dưới đây có thể xóa volume `elasticsearch_data` và làm mất toàn bộ index local:

```bash
docker compose down -v
```

Sau khi mất volume, backend có thể cần reindex lại dữ liệu sản phẩm. Compose đang bật `Elasticsearch__RunStartupReindex=true`, nhưng chi tiết reindex có chạy thành công hay không cần kiểm tra thêm trong log backend.

## 8. Lỗi thường gặp

### 8.1. Elasticsearch khởi động chậm

- Dấu hiệu: `docker compose ps elasticsearch` hiển thị container chưa `healthy`, hoặc healthcheck mất nhiều thời gian mới pass.
- Nguyên nhân: Elasticsearch cần thời gian khởi động JVM, load plugin và mở data path `/usr/share/elasticsearch/data`. Healthcheck trong Compose chạy mỗi 10 giây, timeout 5 giây và retry 10 lần.
- Cách xử lý: Theo dõi log:

  ```bash
  docker compose logs -f elasticsearch
  ```

  Sau đó kiểm tra lại health:

  ```bash
  docker compose ps elasticsearch
  curl http://localhost:9200/_cluster/health
  ```

### 8.2. Thiếu RAM

- Dấu hiệu: Container `ecommerce-elasticsearch` restart liên tục, dừng bất thường, hoặc log có lỗi liên quan JVM/heap/memory.
- Nguyên nhân: Compose đặt `ES_JAVA_OPTS=-Xms512m -Xmx512m`, nghĩa là Elasticsearch cần heap 512 MB. Ngoài heap, container vẫn cần thêm RAM cho native memory và filesystem cache.
- Cách xử lý: Đóng bớt service không cần thiết hoặc tăng RAM cấp cho Docker Desktop. Nếu vẫn lỗi, cần kiểm tra thêm log Elasticsearch:

  ```bash
  docker compose logs -f elasticsearch
  ```

  Chỉ chỉnh `ES_JAVA_OPTS` khi hiểu rõ giới hạn RAM của máy và tác động tới Elasticsearch.

### 8.3. Healthcheck fail

- Dấu hiệu: `docker compose ps elasticsearch` không hiển thị `healthy`, dù container có thể vẫn đang chạy.
- Nguyên nhân: Healthcheck trong Compose yêu cầu endpoint `_cluster/health` trả về `green` hoặc `yellow`. Nếu Elasticsearch chưa sẵn sàng, endpoint không trả lời kịp, hoặc status là `red`, healthcheck sẽ fail.
- Cách xử lý: Kiểm tra trực tiếp:

  ```bash
  curl http://localhost:9200/_cluster/health
  docker compose logs -f elasticsearch
  ```

  Nếu status là `red`, cần xem log để biết index/shard nào lỗi. Nếu endpoint chưa phản hồi, chờ thêm hoặc kiểm tra lỗi khởi động.

### 8.4. Port 9200 bị chiếm

- Dấu hiệu: `docker compose up -d elasticsearch` thất bại và output báo không bind được port `9200` hoặc port is already allocated.
- Nguyên nhân: Máy host đã có Elasticsearch local hoặc container khác đang dùng port `9200`.
- Cách xử lý: Dừng tiến trình đang chiếm port `9200`, hoặc sửa mapping port trong `docker-compose.yml` vì Compose đang khai báo cố định:

  ```yaml
  ports:
    - "9200:9200"
  ```

  Khi backend chạy trong Compose, backend vẫn nên dùng URL nội bộ `http://elasticsearch:9200`.

### 8.5. Backend không kết nối được Elasticsearch

- Dấu hiệu: Log backend báo lỗi kết nối Elasticsearch, connection refused, timeout, hoặc không resolve được host.
- Nguyên nhân: Elasticsearch chưa chạy, chưa `healthy`, backend dùng sai URL, hoặc connection string dùng `localhost:9200` trong container backend.
- Cách xử lý: Kiểm tra Elasticsearch trước:

  ```bash
  docker compose ps elasticsearch
  curl http://localhost:9200/_cluster/health
  ```

  Kiểm tra cấu hình backend trong Compose. Giá trị đúng khi chạy trong Docker network là:

  ```text
  http://elasticsearch:9200
  ```

### 8.6. Index cũ hoặc dữ liệu search không cập nhật

- Dấu hiệu: API search trả dữ liệu cũ, thiếu sản phẩm mới, hoặc filter theo dữ liệu sản phẩm không đúng với database hiện tại.
- Nguyên nhân: Index nằm trong volume `elasticsearch_data`, nên dữ liệu index cũ có thể vẫn còn sau khi restart container. Compose có bật `Elasticsearch__RunStartupReindex=true` và `Elasticsearch__RunDailyReindex=true`, nhưng việc reindex có chạy đúng hay không cần kiểm tra thêm trong log backend.
- Cách xử lý: Kiểm tra log backend và Elasticsearch:

  ```bash
  docker compose logs -f backend
  docker compose logs -f elasticsearch
  ```

  Nếu cần reset index local và chấp nhận mất dữ liệu index, có thể xóa volume bằng:

  ```bash
  docker compose down -v
  docker compose up -d elasticsearch
  ```

  Lưu ý `docker compose down -v` cũng có thể xóa các volume khác trong stack, không chỉ `elasticsearch_data`.

### 8.7. Lỗi build image custom từ `elasticsearch.Dockerfile`

- Dấu hiệu: `docker compose up -d elasticsearch` hoặc `docker compose build elasticsearch` thất bại ở bước build image `ecommerce-elasticsearch-icu:8.16.3`.
- Nguyên nhân: Service này không dùng image pull trực tiếp mà build bằng:

  ```yaml
  build:
    context: .
    dockerfile: elasticsearch.Dockerfile
  image: ecommerce-elasticsearch-icu:8.16.3
  ```

  Vì vậy lỗi có thể đến từ Dockerfile, base image Elasticsearch, hoặc bước cài plugin trong Dockerfile. Dockerfile hiện được Compose trỏ tới là `docker-compose/elasticsearch.Dockerfile`.

- Cách xử lý: Build riêng để xem lỗi rõ hơn:

  ```bash
  docker compose build elasticsearch
  ```

  Nếu lỗi ở plugin hoặc base image, mở `docker-compose/elasticsearch.Dockerfile` để kiểm tra. Nếu chưa chắc nguyên nhân cụ thể từ log build, cần kiểm tra thêm.
