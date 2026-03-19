using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Banners.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;
using System.Linq.Expressions;

namespace Ecommerce.Application.Features.Banners.Queries.GetPaged
{
    public class GetPagedBannerQueryHandler : IRequestHandler<GetPagedBannerQuery, Result<PaginatedList<BannerDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEnhancedLogger _logger;
        private readonly IFileStorageService _fileStorageService;


        public GetPagedBannerQueryHandler(IUnitOfWork unitOfWork,
            IMapper mapper,
            IEnhancedLogger logger,
            IFileStorageService fileStorageService)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _fileStorageService = fileStorageService ?? throw new ArgumentNullException(nameof(fileStorageService));
        }

        public async Task<Result<PaginatedList<BannerDto>>> Handle(GetPagedBannerQuery request, CancellationToken cancellationToken)
        {
            try
            {

                // Xây dựng biểu thức filter từ các tham số truy vấn
                Expression<Func<Banner, bool>> filter = banner =>
                    (string.IsNullOrEmpty(request.SearchTerm)
                    || banner.Title.Contains(request.SearchTerm)
                    || banner.Description.Contains(request.SearchTerm));
                ;
                // Xây dựng sắp xếp từ tham số SortBy và IsDescending
                Func<IQueryable<Banner>, IOrderedQueryable<Banner>> orderBy = query =>
                {
                    return request.SortBy.ToLower() switch
                    {
                        "title" => request.IsDescending
                           ? query.OrderByDescending(c => c.Title)
                           : query.OrderBy(c => c.Title),
                        "createdat" => request.IsDescending
                            ? query.OrderByDescending(c => c.CreatedAt)
                            : query.OrderBy(c => c.CreatedAt),
                        _ => query.OrderBy(c => c.Id)
                    };
                };

                // Gọi phương thức GetPaginatedAsync
                var paginatedResult = await _unitOfWork.Banners
                    .GetPaginatedAsync(
                        filter: filter,
                        orderBy: orderBy,
                        pageIndex: request.PageNumber,
                        pageSize: request.PageSize,
                        cancellationToken: cancellationToken
                        );

                // Ánh xạ kết quả sang DTO
                var bannerDtos = _mapper.Map<List<BannerDto>>(paginatedResult.Items);
                // Cập nhật URL cho hình ảnh
                foreach (var bannerDto in bannerDtos)
                {
                    bannerDto.ImageUrl = await _fileStorageService.GetFileUrlAsync(bannerDto.ImageUrl);
                }
                // Tạo kết quả trả về
                var result = new PaginatedList<BannerDto>(
                    bannerDtos,
                    paginatedResult.TotalCount,
                    paginatedResult.PageIndex,
                    paginatedResult.PageSize);


                return Result<PaginatedList<BannerDto>>.Success(result);
            }
            catch (Exception ex)
            {
                // Ghi log lỗi
                await _logger.LogExceptionAsync(ex, "GetPagedBannerQueryHandler.Handle");
                return Result<PaginatedList<BannerDto>>.BadRequest(ex.Message);
            }
        }
    }
}

