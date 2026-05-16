using Ecommerce.Application.Common.Exceptions;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Orders.Queries.GetOrderById
{
    [Authorize(Policy = EPermissions.ViewOrders)]
    public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, Result<OrderDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;
        private readonly ICurrentUserService _currentUserService;


        public GetOrderByIdQueryHandler(IUnitOfWork unitOfWork,
            IMapper mapper,
            IFileStorageService fileStorageService,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _fileStorageService = fileStorageService ?? throw new ArgumentNullException(nameof(fileStorageService));
            _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
        }

        public async Task<Result<OrderDto>> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Get the order with its items and products
                var query = _unitOfWork.Orders.GetQueryable();
                var order = await query
                    .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Product)
                    .Include(o => o.ApplicationUser)
                    .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

                if (order == null)
                {
                    return Result<OrderDto>.NotFound($"Không tìm thấy đơn hàng với ID {request.Id}");
                }

                // Check if user is allowed to view this order
                var currentUserId = _currentUserService.UserId;
                var isAdmin = _currentUserService.IsInRole(EUserRoles.Admin);
                var isManager = _currentUserService.IsInRole(EUserRoles.Manager);
                var isStaff = _currentUserService.IsInRole(EUserRoles.Staff);

                if (!isAdmin && !isManager && !isStaff && order.ApplicationUserId != currentUserId)
                {
                    return Result<OrderDto>.Forbidden("Bạn không có quyền xem đơn hàng này.");
                }

                // Map to DTO
                var orderDto = _mapper.Map<OrderDto>(order);

                // Process image URLs
                foreach (var item in orderDto.OrderItems)
                {
                    if (!string.IsNullOrEmpty(item.Image))
                    {
                        item.Image = await _fileStorageService.GetFileUrlAsync(item.Image);
                    }
                }

                return Result<OrderDto>.Success(orderDto);
            }
            catch (NotFoundException ex)
            {
                return Result<OrderDto>.NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return Result<OrderDto>.BadRequest($"Lỗi khi truy xuất đơn hàng: {ex.Message}");
            }
        }
    }
}

