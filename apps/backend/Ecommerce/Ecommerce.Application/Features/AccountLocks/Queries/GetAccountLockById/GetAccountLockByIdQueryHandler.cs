using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.AccountLocks.Dto;
using Ecommerce.Domain.Interfaces.Base;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.AccountLocks.Queries.GetAccountLockById
{

    public class GetActiveAboutQueryHandler : IRequestHandler<GetAccountLockByIdQuery, Result<AccountLockDto>>
    {
        private readonly IRepository<Ecommerce.Domain.Entities.AccountLock> _repository;
        private readonly IMapper _mapper;

        public GetActiveAboutQueryHandler(
            IRepository<Ecommerce.Domain.Entities.AccountLock> repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Result<AccountLockDto>> Handle(GetAccountLockByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {

                var accountLock = await _repository.GetByIdWithIncludeAsync(request.Id,
                    query => query.Include(entity => entity.LockedByUser),
                    cancellationToken);

                if (accountLock == null)
                {
                    return Result<AccountLockDto>.NotFound("Không tìm thấy thông tin.");
                }

                var result = _mapper.Map<AccountLockDto>(accountLock);

                return Result<AccountLockDto>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<AccountLockDto>.BadRequest(ex.Message);
            }
        }
    }
}

