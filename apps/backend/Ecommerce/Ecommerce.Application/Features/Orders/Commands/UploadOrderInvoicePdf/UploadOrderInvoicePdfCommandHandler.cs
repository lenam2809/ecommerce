using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using Ecommerce.Domain.ValueObjects;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Orders.Commands.UploadOrderInvoicePdf
{
    public class UploadOrderInvoicePdfCommandHandler : IRequestHandler<UploadOrderInvoicePdfCommand, Result<OrderInvoiceDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileStorageService _fileStorageService;
        private readonly IMapper _mapper;
        private readonly IEnhancedLogger _logger;

        public UploadOrderInvoicePdfCommandHandler(
            IUnitOfWork unitOfWork,
            IFileStorageService fileStorageService,
            IMapper mapper,
            IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _fileStorageService = fileStorageService;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<Result<OrderInvoiceDto>> Handle(UploadOrderInvoicePdfCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var order = await _unitOfWork.Orders.GetQueryable()
                    .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

                if (order == null)
                    return Result<OrderInvoiceDto>.NotFound($"Không tìm thấy đơn hàng với ID {request.OrderId}");

                string? uploadedFileUrl = null;
                if (request.File != null && request.File.Length > 0)
                {
                    var extension = Path.GetExtension(request.File.FileName).ToLowerInvariant();
                    if (extension != ".pdf")
                    {
                        return Result<OrderInvoiceDto>.BadRequest("Chỉ chấp nhận upload file hóa đơn định dạng PDF.");
                    }

                    if (request.File.Length > 10 * 1024 * 1024)
                    {
                        return Result<OrderInvoiceDto>.BadRequest("Dung lượng file PDF hóa đơn không được vượt quá 10MB.");
                    }

                    var customSlug = $"invoice_{order.Code}_{DateTime.UtcNow:yyyyMMddHHmmss}";
                    var relativePath = await _fileStorageService.SaveFileAsync(request.File, "invoices", customSlug);
                    uploadedFileUrl = await _fileStorageService.GetFileUrlAsync(relativePath);
                }

                order.Invoice ??= new OrderInvoice();
                order.Invoice.RequireInvoice = true;

                if (!string.IsNullOrWhiteSpace(request.TaxCode))
                    order.Invoice.TaxCode = request.TaxCode.Trim();

                if (!string.IsNullOrWhiteSpace(request.CompanyName))
                    order.Invoice.CompanyName = request.CompanyName.Trim();

                if (!string.IsNullOrWhiteSpace(request.CompanyAddress))
                    order.Invoice.CompanyAddress = request.CompanyAddress.Trim();

                if (!string.IsNullOrWhiteSpace(request.InvoiceEmail))
                    order.Invoice.InvoiceEmail = request.InvoiceEmail.Trim();

                if (!string.IsNullOrWhiteSpace(uploadedFileUrl))
                    order.Invoice.InvoiceFileUrl = uploadedFileUrl;

                _unitOfWork.Orders.Update(order);
                await _unitOfWork.CompleteAsync(cancellationToken);

                await _logger.LogAsync(ELogLevel.Information,
                    "Uploaded VAT invoice for Order {OrderId}. File: {FileUrl}",
                    "UploadOrderInvoicePdf",
                    properties: new Dictionary<string, object?>
                    {
                        { "OrderId", order.Id },
                        { "InvoiceFileUrl", order.Invoice.InvoiceFileUrl }
                    });

                var dto = _mapper.Map<OrderInvoiceDto>(order.Invoice);
                return Result<OrderInvoiceDto>.Success(dto);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Lỗi khi upload hóa đơn VAT");
                return Result<OrderInvoiceDto>.BadRequest($"Không thể lưu hóa đơn VAT: {ex.Message}");
            }
        }
    }
}
