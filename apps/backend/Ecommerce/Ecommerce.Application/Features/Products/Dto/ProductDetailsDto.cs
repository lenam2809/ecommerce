namespace Ecommerce.Application.Features.Products.Dto
{
    public class ProductDetailsDto : ProductDto
    {
        public List<string> Images { get; set; } = new List<string>();
        // Specifications and Variants are already in ProductDto
    }
}

