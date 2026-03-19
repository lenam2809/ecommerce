using FluentValidation;

namespace Ecommerce.Application.Features.Categories.Queries.GetCategories
{
    public class GetCategoriesQueryValidator : AbstractValidator<GetCategoriesQuery>
    {
        public GetCategoriesQueryValidator()
        {
            RuleFor(v => v.PageNumber)
                .GreaterThanOrEqualTo(1)
                .WithMessage("Số trang phải lớn hơn hoặc bằng 1.");

            RuleFor(v => v.PageSize)
                .GreaterThanOrEqualTo(1)
                .WithMessage("Kích thước trang phải lớn hơn hoặc bằng 1.")
                .LessThanOrEqualTo(100)
                .WithMessage("Kích thước trang phải nhỏ hơn hoặc bằng 100.");

            RuleFor(v => v.SortBy)
                .Must(sortBy => string.IsNullOrEmpty(sortBy) ||
                    new[] { "name", "createdAt" }.Contains(sortBy.ToLower()))
                .WithMessage("Sắp xếp theo phải là một trong: name, createdAt.");
        }
    }
}

