using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.About.Queries.GetAboutById;
using Ecommerce.Domain.Interfaces.Base;
using MediatR;

namespace Ecommerce.Application.Features.About.Commands.DeleteAbout
{
    public class DeleteAboutCommandHandler : IRequestHandler<DeleteAboutCommand, Result<bool>>
    {
        private readonly IRepository<Ecommerce.Domain.Entities.About> _repository;
        private readonly ICacheService _cacheService;


        public DeleteAboutCommandHandler(IRepository<Ecommerce.Domain.Entities.About> repository,
            ICacheService cacheService)
        {
            _repository = repository;
            _cacheService = cacheService;
        }

        public async Task<Result<bool>> Handle(DeleteAboutCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var about = await _repository.GetByIdAsync(request.Id, cancellationToken);
                if (about == null)
                    return Result<bool>.NotFound("Không tìm thấy thông tin giới thiệu");

                _repository.Delete(about);
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

