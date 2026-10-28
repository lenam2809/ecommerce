using AutoMapper;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Showrooms.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Showrooms.Queries.GetAdminShowrooms
{
    public class GetAdminShowroomsQueryHandler : IRequestHandler<GetAdminShowroomsQuery, Result<List<AdminShowroomDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetAdminShowroomsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<List<AdminShowroomDto>>> Handle(GetAdminShowroomsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var query = _unitOfWork.BaseRepository<Showroom>()
                    .GetQueryable()
                    .AsNoTracking();

                if (!string.IsNullOrWhiteSpace(request.Region))
                {
                    var region = request.Region.Trim();
                    query = query.Where(s => s.Region == region);
                }

                if (!string.IsNullOrWhiteSpace(request.Search))
                {
                    var term = request.Search.Trim().ToLower();
                    query = query.Where(s =>
                        s.Code.ToLower().Contains(term) ||
                        s.Name.ToLower().Contains(term) ||
                        s.City.ToLower().Contains(term) ||
                        s.Address.ToLower().Contains(term));
                }

                if (request.IsActive.HasValue)
                {
                    query = query.Where(s => s.IsActive == request.IsActive.Value);
                }

                var showrooms = await query
                    .OrderBy(s => s.DisplayOrder)
                    .ThenBy(s => s.Name)
                    .ToListAsync(cancellationToken);

                // Lấy thống kê tồn kho theo cơ sở
                var inventories = await _unitOfWork.BaseRepository<ShowroomInventory>()
                    .GetQueryable()
                    .AsNoTracking()
                    .ToListAsync(cancellationToken);

                var statsByShowroom = inventories
                    .GroupBy(i => i.ShowroomId)
                    .ToDictionary(
                        g => g.Key,
                        g => new
                        {
                            TotalSkusWithStock = g.Count(i => i.Quantity > 0),
                            TotalStockQuantity = g.Sum(i => i.Quantity)
                        });

                var dtos = _mapper.Map<List<AdminShowroomDto>>(showrooms);

                foreach (var dto in dtos)
                {
                    if (statsByShowroom.TryGetValue(dto.Id, out var stats))
                    {
                        dto.TotalSkusWithStock = stats.TotalSkusWithStock;
                        dto.TotalStockQuantity = stats.TotalStockQuantity;
                    }
                }

                return Result<List<AdminShowroomDto>>.Success(dtos);
            }
            catch (Exception ex)
            {
                return Result<List<AdminShowroomDto>>.BadRequest($"Lỗi khi lấy danh sách showroom quản trị: {ex.Message}");
            }
        }
    }
}
