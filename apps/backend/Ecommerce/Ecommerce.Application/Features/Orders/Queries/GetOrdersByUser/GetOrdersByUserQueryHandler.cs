using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Orders.Queries.GetOrdersByUser
{
    public class GetOrdersByUserQueryHandler : IRequestHandler<GetOrdersByUserQuery, Result<List<OrderDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;

        public GetOrdersByUserQueryHandler(IUnitOfWork unitOfWork, IMapper mapper, IFileStorageService fileStorageService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
        }

        public async Task<Result<List<OrderDto>>> Handle(GetOrdersByUserQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var orders = await _unitOfWork.Orders
                    .GetQueryable()
                    .Where(o => o.ApplicationUserId == request.UserId)
                    .Include(o => o.OrderItems)
                    .OrderByDescending(o => o.OrderDate)
                    .ToListAsync(cancellationToken);

                var orderDtos = _mapper.Map<List<OrderDto>>(orders);

                // Process image URLs
                foreach (var order in orderDtos)
                {
                    foreach (var item in order.OrderItems)
                    {
                        if (!string.IsNullOrEmpty(item.Image))
                        {
                            item.Image = await _fileStorageService.GetFileUrlAsync(item.Image);
                        }
                    }
                }

                return Result<List<OrderDto>>.Success(orderDtos);
            }
            catch (Exception ex)
            {
                return Result<List<OrderDto>>.BadRequest(ex.Message);
            }
        }
    }
}

