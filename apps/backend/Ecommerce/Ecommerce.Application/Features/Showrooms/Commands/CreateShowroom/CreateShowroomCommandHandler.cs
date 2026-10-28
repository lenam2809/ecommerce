using AutoMapper;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Showrooms.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Showrooms.Commands.CreateShowroom
{
    public class CreateShowroomCommandHandler : IRequestHandler<CreateShowroomCommand, Result<ShowroomDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CreateShowroomCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<ShowroomDto>> Handle(CreateShowroomCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var showroom = _mapper.Map<Showroom>(request);

                if (string.IsNullOrWhiteSpace(showroom.Province))
                {
                    showroom.Province = showroom.City;
                }

                if (string.IsNullOrWhiteSpace(showroom.Phone))
                {
                    showroom.Phone = "1800 6868";
                }

                if (string.IsNullOrWhiteSpace(showroom.OpeningHours))
                {
                    showroom.OpeningHours = "08:00 - 21:30";
                }

                var created = await _unitOfWork.BaseRepository<Showroom>().AddAsync(showroom, cancellationToken);
                await _unitOfWork.CompleteAsync(cancellationToken);

                var dto = _mapper.Map<ShowroomDto>(created);
                return Result<ShowroomDto>.Success(dto);
            }
            catch (Exception ex)
            {
                return Result<ShowroomDto>.BadRequest($"Lỗi khi tạo showroom mới: {ex.Message}");
            }
        }
    }
}
