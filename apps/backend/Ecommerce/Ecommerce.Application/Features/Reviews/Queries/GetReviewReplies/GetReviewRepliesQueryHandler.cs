using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reviews.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Reviews.Queries.GetReviewReplies
{
    public class GetReviewRepliesQueryHandler : IRequestHandler<GetReviewRepliesQuery, Result<List<ReviewReplyDto>>>
    {
        private readonly IReviewReplyRepository _reviewReplyRepository;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;

        public GetReviewRepliesQueryHandler(
            IReviewReplyRepository reviewReplyRepository,
            IMapper mapper,
            IFileStorageService fileStorageService)
        {
            _reviewReplyRepository = reviewReplyRepository;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
        }

        public async Task<Result<List<ReviewReplyDto>>> Handle(GetReviewRepliesQuery request, CancellationToken cancellationToken)
        {
            var replies = await _reviewReplyRepository.GetReviewRepliesAsync(request.ReviewId, cancellationToken);

            var replyDtos = _mapper.Map<List<ReviewReplyDto>>(replies);

            // Update image URLs and check if liked by current user
            foreach (var reply in replyDtos)
            {
                if (!string.IsNullOrEmpty(reply.UserAvatar))
                {
                    reply.UserAvatar = await _fileStorageService.GetFileUrlAsync(reply.UserAvatar);
                }

                if (request.CurrentUserId.HasValue)
                {
                    reply.IsLikedByCurrentUser = await _reviewReplyRepository.IsLikedByUserAsync(reply.Id, request.CurrentUserId.Value, cancellationToken);
                }
            }

            return Result<List<ReviewReplyDto>>.Success(replyDtos);
        }
    }
}

