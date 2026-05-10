using FluentValidation;

namespace Ecommerce.Application.Features.Products.Queries.SearchProducts
{
    public class SearchProductsQueryValidator : AbstractValidator<SearchProductsQuery>
    {
        private static readonly string[] AllowedSorts =
        [
            "relevance",
            "name",
            "price",
            "price_asc",
            "price_desc",
            "newest",
            "createdat",
            "rating"
        ];

        public SearchProductsQueryValidator()
        {
            RuleFor(x => x.PageNumber)
                .GreaterThanOrEqualTo(1);

            RuleFor(x => x.Page)
                .GreaterThanOrEqualTo(1)
                .When(x => x.Page.HasValue);

            RuleFor(x => x.PageSize)
                .InclusiveBetween(1, 100);

            RuleFor(x => x.MinPrice)
                .GreaterThanOrEqualTo(0)
                .When(x => x.MinPrice.HasValue);

            RuleFor(x => x.MaxPrice)
                .GreaterThanOrEqualTo(0)
                .When(x => x.MaxPrice.HasValue);

            RuleFor(x => x)
                .Must(x => !x.MinPrice.HasValue || !x.MaxPrice.HasValue || x.MinPrice <= x.MaxPrice)
                .WithMessage("MinPrice must be less than or equal to MaxPrice.");

            RuleFor(x => x.SortBy)
                .Must(x => string.IsNullOrWhiteSpace(x) || AllowedSorts.Contains(x.ToLowerInvariant()))
                .WithMessage($"SortBy must be one of: {string.Join(", ", AllowedSorts)}.");
        }
    }
}
