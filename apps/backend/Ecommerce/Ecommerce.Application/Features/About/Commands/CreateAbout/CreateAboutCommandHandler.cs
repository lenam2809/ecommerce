using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.About.Commands.CreateAbout
{
    public class CreateAboutCommandHandler : IRequestHandler<CreateAboutCommand, Result<Guid>>
    {
        private readonly IRepository<Ecommerce.Domain.Entities.About> _repository;
        private readonly IMapper _mapper;
        private readonly ICacheService _cacheService;

        public CreateAboutCommandHandler(IRepository<Ecommerce.Domain.Entities.About> repository,
            IMapper mapper,
            ICacheService cacheService)
        {
            _repository = repository;
            _mapper = mapper;
            _cacheService = cacheService;
        }

        public async Task<Result<Guid>> Handle(CreateAboutCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var about = new Ecommerce.Domain.Entities.About
                {
                    Hero = _mapper.Map<HeroSection>(request.Hero),
                    Values = _mapper.Map<List<ValueItem>>(request.Values),
                    History = _mapper.Map<HistorySection>(request.History),
                    Team = _mapper.Map<List<TeamMember>>(request.Team),
                    Cta = _mapper.Map<CtaSection>(request.Cta)
                };

                await _repository.AddAsync(about, cancellationToken);
                await _repository.SaveChangesAsync(cancellationToken);

                // Xóa cache liên quan
                await _cacheService.RemoveAsync(CacheKeys.GetAbouts());

                return Result<Guid>.Success(about.Id);
            }
            catch (Exception ex)
            {
                return Result<Guid>.BadRequest(ex.Message);
            }
        }
    }

}

