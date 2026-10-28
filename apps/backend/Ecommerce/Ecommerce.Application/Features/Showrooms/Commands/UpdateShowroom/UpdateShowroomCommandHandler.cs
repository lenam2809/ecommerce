using AutoMapper;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Showrooms.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Showrooms.Commands.UpdateShowroom
{
    public class UpdateShowroomCommandHandler : IRequestHandler<UpdateShowroomCommand, Result<ShowroomDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UpdateShowroomCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<ShowroomDto>> Handle(UpdateShowroomCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var showroom = await _unitOfWork.BaseRepository<Showroom>()
                    .GetByIdAsync(request.Id, cancellationToken);

                if (showroom == null)
                {
                    return Result<ShowroomDto>.NotFound($"Không tìm thấy Showroom với Id: {request.Id}");
                }

                showroom.Code = request.Code.Trim();
                showroom.Name = request.Name.Trim();
                showroom.Region = request.Region.Trim();
                showroom.City = request.City.Trim();
                showroom.Province = !string.IsNullOrWhiteSpace(request.Province) ? request.Province.Trim() : request.City.Trim();
                showroom.District = request.District.Trim();
                showroom.Ward = request.Ward;
                showroom.Address = request.Address.Trim();
                showroom.Phone = !string.IsNullOrWhiteSpace(request.Phone) ? request.Phone.Trim() : "1800 6868";
                showroom.OpeningHours = !string.IsNullOrWhiteSpace(request.OpeningHours) ? request.OpeningHours.Trim() : "08:00 - 21:30";
                showroom.Latitude = request.Latitude;
                showroom.Longitude = request.Longitude;
                showroom.GoogleMapIframeUrl = request.GoogleMapIframeUrl;
                showroom.IsFlagship = request.IsFlagship;
                showroom.HasInstantPickup = request.HasInstantPickup;
                showroom.IsActive = request.IsActive;
                showroom.DisplayOrder = request.DisplayOrder;

                _unitOfWork.BaseRepository<Showroom>().Update(showroom);
                await _unitOfWork.CompleteAsync(cancellationToken);

                var dto = _mapper.Map<ShowroomDto>(showroom);
                return Result<ShowroomDto>.Success(dto);
            }
            catch (Exception ex)
            {
                return Result<ShowroomDto>.BadRequest($"Lỗi khi cập nhật showroom: {ex.Message}");
            }
        }
    }
}
