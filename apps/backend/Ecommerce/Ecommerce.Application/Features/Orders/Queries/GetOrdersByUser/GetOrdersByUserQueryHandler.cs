using AutoMapper;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Orders.Queries.GetOrdersByUser
{
    public class GetOrdersByUserQueryHandler : IRequestHandler<GetOrdersByUserQuery, Result<List<OrderDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;
        private readonly ICurrentUserService _currentUserService;

        public GetOrdersByUserQueryHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IFileStorageService fileStorageService,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
            _currentUserService = currentUserService;
        }

        public async Task<Result<List<OrderDto>>> Handle(GetOrdersByUserQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var currentUserId = _currentUserService.UserId;
                if (!currentUserId.HasValue)
                {
                    return Result<List<OrderDto>>.Unauthorized();
                }

                var canViewAll = _currentUserService.IsInRole(EUserRoles.Admin)
                                 || _currentUserService.IsInRole(EUserRoles.Manager)
                                 || _currentUserService.IsInRole(EUserRoles.Staff);
                var targetUserId = canViewAll ? request.UserId : currentUserId.Value;

                var orders = await _unitOfWork.Orders
                    .GetQueryable()
                    .Where(o => o.ApplicationUserId == targetUserId)
                    .Include(o => o.OrderItems)
                    .OrderByDescending(o => o.OrderDate)
                    .ToListAsync(cancellationToken);

                var orderDtos = _mapper.Map<List<OrderDto>>(orders);

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
