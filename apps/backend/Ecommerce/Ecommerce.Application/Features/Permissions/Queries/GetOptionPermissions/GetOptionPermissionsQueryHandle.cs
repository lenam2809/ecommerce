using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Brands.Queries.GetOptionPermissions;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Permissions.Queries.GetOptionPermissions
{
    public class GetOptionPermissionsQueryHandler : IRequestHandler<GetOptionPermissionsQuery, Result<List<Option>>>
    {
        private readonly IPermissionRepository _repository;

        public GetOptionPermissionsQueryHandler(IPermissionRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<List<Option>>> Handle(GetOptionPermissionsQuery request, CancellationToken cancellationToken)
        {
            var Permissions = await _repository.GetAllAsync(cancellationToken);

            // Transform categories into options
            var options = Permissions.Select(c => new Option
            {
                Value = c.Id.ToString(),
                Label = c.Name,
                Disabled = false // You could add logic to disable certain categories if needed
            }).ToList();

            return Result<List<Option>>.Success(options);
        }
    }
}

