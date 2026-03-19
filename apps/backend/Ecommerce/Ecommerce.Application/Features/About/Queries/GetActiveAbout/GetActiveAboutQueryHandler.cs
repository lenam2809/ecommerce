using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.About.Dto;
using Ecommerce.Domain.Interfaces.Base;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.About.Queries.GetActiveAbout
{
    public class GetActiveAboutQueryHandler : IRequestHandler<GetActiveAboutQuery, Result<AboutDto>>
    {
        private readonly IRepository<Ecommerce.Domain.Entities.About> _repository;
        private readonly IMapper _mapper;

        public GetActiveAboutQueryHandler(
            IRepository<Ecommerce.Domain.Entities.About> repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Result<AboutDto>> Handle(GetActiveAboutQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var about = await _repository.FirstOrDefaultAsync(a => a.IsActive, cancellationToken);

                if (about == null)
                {
                    return Result<AboutDto>.NotFound("Không tìm thấy thông tin giới thiệu đang hoạt động");
                }

                var result = _mapper.Map<AboutDto>(about);

                return Result<AboutDto>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<AboutDto>.BadRequest(ex.Message);
            }
        }
    }
}

