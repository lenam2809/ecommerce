using AutoMapper;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Showrooms.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Showrooms.Queries.GetShowrooms
{
    public class GetShowroomsQueryHandler : IRequestHandler<GetShowroomsQuery, Result<List<ShowroomDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetShowroomsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<List<ShowroomDto>>> Handle(GetShowroomsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var query = _unitOfWork.BaseRepository<Showroom>()
                    .GetQueryable()
                    .AsNoTracking()
                    .Where(s => s.IsActive);

                if (!string.IsNullOrWhiteSpace(request.Province))
                {
                    var prov = request.Province.Trim().ToLower();
                    query = query.Where(s => (s.Province != null && s.Province.ToLower().Contains(prov)) || (s.City != null && s.City.ToLower().Contains(prov)));
                }

                var showrooms = await query
                    .OrderBy(s => s.DisplayOrder)
                    .ThenBy(s => s.Name)
                    .ToListAsync(cancellationToken);

                var dtos = _mapper.Map<List<ShowroomDto>>(showrooms);
                return Result<List<ShowroomDto>>.Success(dtos);
            }
            catch (Exception ex)
            {
                return Result<List<ShowroomDto>>.BadRequest($"Lỗi khi lấy danh sách showroom: {ex.Message}");
            }
        }
    }
}
