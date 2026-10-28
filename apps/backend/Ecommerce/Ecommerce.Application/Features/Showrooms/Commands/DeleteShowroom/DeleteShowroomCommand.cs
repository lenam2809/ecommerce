using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Showrooms.Commands.DeleteShowroom
{
    public class DeleteShowroomCommand : IRequest<Result<bool>>
    {
        public Guid Id { get; set; }
    }
}
