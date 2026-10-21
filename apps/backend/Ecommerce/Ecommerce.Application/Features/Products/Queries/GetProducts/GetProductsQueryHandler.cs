using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Products.Queries.GetProducts
{
    public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, Result<List<ProductDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;


        public GetProductsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<List<ProductDto>>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var products = await _unitOfWork.Products
                    .GetQueryable()
                    .AsNoTracking()
                    .Include(p => p.Category)
                    .Include(p => p.Brand)
                    .Include(p => p.Specifications)
                    .ToListAsync(cancellationToken);

                var result = _mapper.Map<List<ProductDto>>(products);

                for (int i = 0; i < products.Count; i++)
                {
                    var p = products[i];
                    var dto = result[i];
                    dto.KeySpecs = Ecommerce.Application.Features.Products.Helpers.ProductSpecHelper.ExtractKeySpecs(
                        p.Specifications, p.Name, p.Category?.Name);
                }

                return Result<List<ProductDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<List<ProductDto>>.BadRequest(ex.Message);
            }

        }
    }

}
