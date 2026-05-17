using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Payments.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Base;
using MediatR;

namespace Ecommerce.Application.Features.Payments.Commands.ProcessPaymentCallback;

public sealed class ProcessPaymentCallbackCommandHandler
    : IRequestHandler<ProcessPaymentCallbackCommand, Result<ProcessPaymentCallbackResultDto>>
{
    private static readonly TimeSpan MaxCallbackAge = TimeSpan.FromMinutes(30);
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPaymentGateway _paymentGateway;

    public ProcessPaymentCallbackCommandHandler(IUnitOfWork unitOfWork, IPaymentGateway paymentGateway)
    {
        _unitOfWork = unitOfWork;
        _paymentGateway = paymentGateway;
    }

    public async Task<Result<ProcessPaymentCallbackResultDto>> Handle(
        ProcessPaymentCallbackCommand request,
        CancellationToken cancellationToken)
    {
        var callback = _paymentGateway.ParseCallback(request.Parameters);

        if (string.IsNullOrWhiteSpace(callback.TransactionRef))
        {
            callback.Success = false;
            callback.GatewayResponseCode = string.IsNullOrWhiteSpace(callback.GatewayResponseCode)
                ? "99"
                : callback.GatewayResponseCode;
            return Result<ProcessPaymentCallbackResultDto>.Success(MapToResult(callback));
        }

        if (!callback.SignatureValid)
        {
            callback.Success = false;
            callback.GatewayResponseCode = "INVALID_SIGNATURE";
            return Result<ProcessPaymentCallbackResultDto>.Success(MapToResult(callback));
        }

        var paymentTransactionsRepo = _unitOfWork.BaseRepository<PaymentTransaction>();
        var transaction = await GetOrCreatePendingTransactionAsync(paymentTransactionsRepo, callback, cancellationToken);
        if (transaction != null && transaction.Status != PaymentTransactionStatus.Pending)
        {
            return Result<ProcessPaymentCallbackResultDto>.Success(MapToResult(MapFromExisting(callback, transaction)));
        }

        var order = await ResolveOrderFromTxnRef(callback.TransactionRef, cancellationToken);
        if (order == null)
        {
            await UpdatePaymentTransactionStatus(
                paymentTransactionsRepo,
                callback.TransactionRef,
                PaymentTransactionStatus.Failed,
                "ORDER_NOT_FOUND",
                callback.Amount,
                cancellationToken);

            callback.Success = false;
            callback.GatewayResponseCode = "ORDER_NOT_FOUND";
            return Result<ProcessPaymentCallbackResultDto>.Success(MapToResult(callback));
        }

        if (callback.CreatedAtUtc.HasValue && DateTime.UtcNow - callback.CreatedAtUtc.Value > MaxCallbackAge)
        {
            await UpdatePaymentTransactionStatus(
                paymentTransactionsRepo,
                callback.TransactionRef,
                PaymentTransactionStatus.Expired,
                "EXPIRED_CALLBACK",
                callback.Amount,
                cancellationToken);

            callback.Success = false;
            callback.GatewayResponseCode = "EXPIRED_CALLBACK";
            return Result<ProcessPaymentCallbackResultDto>.Success(MapToResult(callback));
        }

        if (order.TotalAmount != callback.Amount)
        {
            await UpdatePaymentTransactionStatus(
                paymentTransactionsRepo,
                callback.TransactionRef,
                PaymentTransactionStatus.Failed,
                "AMOUNT_MISMATCH",
                callback.Amount,
                cancellationToken);

            callback.Success = false;
            callback.GatewayResponseCode = "AMOUNT_MISMATCH";
            return Result<ProcessPaymentCallbackResultDto>.Success(MapToResult(callback));
        }

        if (callback.GatewayResponseCode == "00")
        {
            if (order.Status != EOrderStatus.Pending)
            {
                await UpdatePaymentTransactionStatus(
                    paymentTransactionsRepo,
                    callback.TransactionRef,
                    PaymentTransactionStatus.Failed,
                    "ORDER_NOT_PAYABLE",
                    callback.Amount,
                    cancellationToken);

                callback.Success = false;
                callback.GatewayResponseCode = "ORDER_NOT_PAYABLE";
                return Result<ProcessPaymentCallbackResultDto>.Success(MapToResult(callback));
            }

            var gatewayTransactionId = string.IsNullOrWhiteSpace(callback.GatewayTransactionId)
                ? callback.TransactionRef
                : callback.GatewayTransactionId;

            var paymentExists = await _unitOfWork.BaseRepository<Payment>()
                .AnyAsync(x => x.TransactionId == gatewayTransactionId || (x.OrderId == order.Id && x.IsSuccessful), cancellationToken);

            if (!paymentExists)
            {
                var payment = new Payment
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    Amount = callback.Amount,
                    PaymentMethod = EPaymentMethod.VNPay,
                    TransactionId = gatewayTransactionId,
                    PaymentDate = DateTime.UtcNow,
                    IsSuccessful = true
                };

                await _unitOfWork.BaseRepository<Payment>().AddAsync(payment, cancellationToken);
            }

            if (order.Status == EOrderStatus.Pending)
            {
                order.UpdateStatus(EOrderStatus.Processing, "VNPay payment confirmed");
                _unitOfWork.Orders.Update(order);
            }

            await UpdatePaymentTransactionStatus(
                paymentTransactionsRepo,
                callback.TransactionRef,
                PaymentTransactionStatus.Success,
                callback.GatewayResponseCode,
                callback.Amount,
                cancellationToken);

            callback.Success = true;
        }
        else
        {
            await UpdatePaymentTransactionStatus(
                paymentTransactionsRepo,
                callback.TransactionRef,
                PaymentTransactionStatus.Failed,
                callback.GatewayResponseCode,
                callback.Amount,
                cancellationToken);

            callback.Success = false;
        }

        await _unitOfWork.CompleteAsync(cancellationToken);

        return Result<ProcessPaymentCallbackResultDto>.Success(MapToResult(callback));
    }

    private async Task<Order?> ResolveOrderFromTxnRef(string txnRef, CancellationToken cancellationToken)
    {
        var orderRepo = _unitOfWork.BaseRepository<Order>();

        if (Guid.TryParse(txnRef, out var orderId))
        {
            var orderById = await orderRepo.GetByIdAsync(orderId, cancellationToken);
            if (orderById != null)
            {
                return orderById;
            }
        }

        return await orderRepo.FirstOrDefaultAsync(o => o.Code == txnRef, cancellationToken);
    }

    private static async Task<PaymentTransaction?> GetOrCreatePendingTransactionAsync(
        IRepository<PaymentTransaction> repository,
        PaymentGatewayCallback callback,
        CancellationToken cancellationToken)
    {
        var existing = await repository.FirstOrDefaultAsync(x => x.TxnRef == callback.TransactionRef, cancellationToken);
        if (existing != null)
        {
            return existing;
        }

        var nowUtc = DateTime.UtcNow;
        await repository.ExecuteCommandAsync(
            "INSERT INTO \"PaymentTransactions\" (\"Id\", \"TxnRef\", \"Amount\", \"Status\", \"ResponseCode\", \"CreatedAt\", \"IsDeleted\", \"ConcurrencyToken\") " +
            "VALUES ({0}, {1}, {2}, {3}, {4}, {5}, FALSE, {6}) " +
            "ON CONFLICT (\"TxnRef\") DO NOTHING",
            [Guid.NewGuid(), callback.TransactionRef, callback.Amount, (int)PaymentTransactionStatus.Pending, callback.GatewayResponseCode, nowUtc, Guid.NewGuid().ToByteArray()],
            cancellationToken);

        return await repository.FirstOrDefaultAsync(x => x.TxnRef == callback.TransactionRef, cancellationToken);
    }

    private static async Task UpdatePaymentTransactionStatus(
        IRepository<PaymentTransaction> repository,
        string txnRef,
        PaymentTransactionStatus status,
        string responseCode,
        decimal amount,
        CancellationToken cancellationToken)
    {
        await repository.ExecuteCommandAsync(
            "UPDATE \"PaymentTransactions\" SET \"Status\" = {0}, \"ResponseCode\" = {1}, \"Amount\" = {2}, \"UpdatedAt\" = {3} WHERE \"TxnRef\" = {4}",
            [(int)status, responseCode, amount, DateTime.UtcNow, txnRef],
            cancellationToken);
    }

    private static PaymentGatewayCallback MapFromExisting(PaymentGatewayCallback callback, PaymentTransaction transaction)
    {
        callback.GatewayResponseCode = transaction.ResponseCode;
        callback.Success = transaction.Status == PaymentTransactionStatus.Success;
        callback.Amount = transaction.Amount;
        return callback;
    }

    private static ProcessPaymentCallbackResultDto MapToResult(PaymentGatewayCallback callback)
    {
        return new ProcessPaymentCallbackResultDto
        {
            TransactionRef = callback.TransactionRef,
            GatewayTransactionId = callback.GatewayTransactionId,
            GatewayResponseCode = callback.GatewayResponseCode,
            Success = callback.Success
        };
    }
}
