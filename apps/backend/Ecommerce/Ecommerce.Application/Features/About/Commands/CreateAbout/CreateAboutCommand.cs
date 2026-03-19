using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.About.Dto;
using MediatR;

namespace Ecommerce.Application.Features.About.Commands.CreateAbout
{
    public record CreateAboutCommand(
        HeroSectionDto Hero,
        List<ValueItemDto> Values,
        HistorySectionDto History,
        List<TeamMemberDto> Team,
        CtaSectionDto Cta
    ) : IRequest<Result<Guid>>;

}

