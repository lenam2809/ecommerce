namespace Ecommerce.Application.Features.Products.Dto
{
    public class ProductComparisonDto
    {
        public List<ProductDto> Products { get; set; } = [];
        public List<ComparisonSpecGroupDto> SpecGroups { get; set; } = [];
    }

    public class ComparisonSpecGroupDto
    {
        public string GroupName { get; set; } = string.Empty;
        public List<ComparisonSpecRowDto> Specs { get; set; } = [];
    }

    public class ComparisonSpecRowDto
    {
        public string Name { get; set; } = string.Empty;
        public Dictionary<string, string> Values { get; set; } = new();
    }
}
