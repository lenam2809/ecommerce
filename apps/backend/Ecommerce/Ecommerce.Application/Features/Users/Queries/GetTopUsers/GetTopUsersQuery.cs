using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Users.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Users.Queries.GetTopUsers
{
    /// <summary>
    /// Query để lấy top 10 người dùng có tổng số tiền chi tiêu lớn nhất
    /// </summary>
    public class GetTopUsersQuery : IRequest<Result<List<UserDto>>>
    {
    }
}

