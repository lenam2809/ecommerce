using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.About.Dto;
using Ecommerce.Application.Features.About.Queries.GetAboutById;
using Ecommerce.Domain.Interfaces.Base;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.About.Commands.UpdateAbout
{
    public record UpdateAboutCommand(
        Guid Id,
        HeroSectionDto Hero,
        List<ValueItemDto> Values,
        HistorySectionDto History,
        List<TeamMemberDto> Team,
        CtaSectionDto Cta
    ) : IRequest<Result<bool>>;

    public class UpdateAboutCommandHandler : IRequestHandler<UpdateAboutCommand, Result<bool>>
    {
        private readonly IRepository<Ecommerce.Domain.Entities.About> _repository;
        private readonly IMapper _mapper;
        private readonly ICacheService _cacheService;


        public UpdateAboutCommandHandler(IRepository<Ecommerce.Domain.Entities.About> repository,
            IMapper mapper,
            ICacheService cacheService)
        {
            _repository = repository;
            _mapper = mapper;
            _cacheService = cacheService;
        }

        public async Task<Result<bool>> Handle(UpdateAboutCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var existingAbout = await _repository.GetByIdAsync(request.Id, cancellationToken);
                if (existingAbout == null)
                    return Result<bool>.NotFound("Không tìm thấy thông tin giới thiệu.");

                _mapper.Map(request, existingAbout);
                existingAbout.UpdatedAt = DateTime.Now;

                _repository.Update(existingAbout);
                await _repository.SaveChangesAsync(cancellationToken);

                // Xóa cache liên quan
                await _cacheService.RemoveAsync(CacheKeys.GetAboutById(new GetAboutByIdQuery { Id = request.Id }));
                await _cacheService.RemoveAsync(CacheKeys.GetAbouts());

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.BadRequest(ex.Message);
            }

        }
    }
}

