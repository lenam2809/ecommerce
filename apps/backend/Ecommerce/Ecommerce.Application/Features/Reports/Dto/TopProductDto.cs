namespace Ecommerce.Application.Features.Reports.Dto
{
    public class TopProductDto
    {
        public Guid ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int TotalQuantitySold { get; set; }
        public int TotalOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
    }

    public class LowStockProductDto
    {
        public Guid ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public int CurrentStock { get; set; }
        public int MinimumStock { get; set; }
        public string StockStatus { get; set; } = string.Empty; // "Critical", "Low", "Warning"
        public decimal Price { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }

    public class ProductReturnRateDto
    {
        public Guid ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public int TotalSold { get; set; }
        public int TotalReturned { get; set; }
        public decimal ReturnRate { get; set; } // Percentage
        public decimal Revenue { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }

    public class ProductsByCategoryDto
    {
        public Guid CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int ProductCount { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal Percentage { get; set; }
        public int TotalQuantitySold { get; set; }
        public decimal AverageProductPrice { get; set; }
    }

    public class ProductPerformanceDto
    {
        public Guid ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Sku { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int QuantitySold { get; set; }
        public int TotalOrders { get; set; }
        public decimal ReturnRate { get; set; }
        public int CurrentStock { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal Rating { get; set; }
        public int ReviewCount { get; set; }
    }


}

