using Ecommerce.Domain.Interfaces;
using FluentValidation;

namespace Ecommerce.Application.Features.Products.Commands.CreateProduct
{
    public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
    {
        private readonly IProductRepository _productRepository;

        public CreateProductCommandValidator(IProductRepository productRepository)
        {
            _productRepository = productRepository;

            RuleFor(p => p.Code)
                .NotEmpty().WithMessage("Mã sản phẩm không được để trống")
                .MaximumLength(20).WithMessage("Mã sản phẩm không được vượt quá 20 ký tự")
                .MustAsync(async (code, cancellation) => await _productRepository.IsCodeUniqueAsync(code, cancellationToken: cancellation))
                .WithMessage("Mã sản phẩm đã tồn tại");

            RuleFor(p => p.Name)
                .NotEmpty().WithMessage("Tên sản phẩm không được để trống")
                .MaximumLength(255).WithMessage("Tên sản phẩm không được vượt quá 255 ký tự");

            RuleFor(p => p.Sku)
                .NotEmpty().WithMessage("SKU không được để trống")
                .MaximumLength(50).WithMessage("SKU không được vượt quá 50 ký tự")
                .MustAsync(async (sku, cancellation) => await _productRepository.IsSkuUniqueAsync(sku, cancellationToken: cancellation))
                .WithMessage("SKU đã tồn tại");

            RuleFor(p => p.Price)
                .GreaterThanOrEqualTo(0).WithMessage("Giá sản phẩm không được âm");

            RuleFor(p => p.SalePrice)
                .Must((command, salePrice) => !salePrice.HasValue || salePrice.Value <= command.Price)
                .WithMessage("Giá khuyến mãi phải nhỏ hơn hoặc bằng giá gốc")
                .When(command => command.SalePrice.HasValue);

            RuleFor(p => p.StockQuantity)
                .GreaterThanOrEqualTo(0).WithMessage("Số lượng trong kho không được âm");

            RuleFor(p => p.Rating)
                .InclusiveBetween(0, 5).WithMessage("Đánh giá phải từ 0 đến 5");

            RuleFor(p => p.CategoryId)
                .NotEmpty().WithMessage("Danh mục sản phẩm không được để trống");

            RuleFor(p => p.BrandId)
                .NotEmpty().WithMessage("Thương hiệu sản phẩm không được để trống");

            // MainImage giờ là string URL
            //RuleFor(p => p.MainImage)
            //    .NotEmpty().WithMessage("Hình ảnh chính là bắt buộc");

        }
    }
}

