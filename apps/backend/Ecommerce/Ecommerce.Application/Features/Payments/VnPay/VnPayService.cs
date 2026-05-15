using Ecommerce.Application.Features.Payments.VnPay.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace Ecommerce.Application.Features.Payments.VnPay
{
    public class VnPayService : IVnPayService
    {
        // Thời gian tối đa callback hợp lệ sau khi tạo (anti-replay)
        private static readonly TimeSpan MaxCallbackAge = TimeSpan.FromMinutes(30);
        private readonly VnPaySettings _settings;
        private readonly IUnitOfWork _unitOfWork;

        public VnPayService(IOptions<VnPaySettings> settings, IUnitOfWork unitOfWork)
        {
            _settings = settings.Value;
            _unitOfWork = unitOfWork;
        }

        public string CreatePaymentUrl(PaymentInformationModel model, HttpContext context)
        {
            return CreatePaymentUrl(model, Utils.GetIpAddress(context));
        }

        public string CreatePaymentUrl(PaymentInformationModel model, string clientIpAddress)
        {
            var timeZoneById = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById);
            var pay = new VnPayLibrary();
            var urlCallBack = _settings.ReturnUrl;

            pay.AddRequestData("vnp_Version", _settings.Version);
            pay.AddRequestData("vnp_Command", "pay");
            pay.AddRequestData("vnp_TmnCode", _settings.TmnCode);
            pay.AddRequestData("vnp_Amount", ((int)model.Amount * 100).ToString());
            pay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss"));
            pay.AddRequestData("vnp_CurrCode", "VND");
            pay.AddRequestData("vnp_IpAddr", string.IsNullOrWhiteSpace(clientIpAddress) ? "127.0.0.1" : clientIpAddress);
            pay.AddRequestData("vnp_Locale", "vn");
            pay.AddRequestData("vnp_OrderInfo", $"{model.Name} {model.OrderDescription} {model.Amount}");
            pay.AddRequestData("vnp_OrderType", model.OrderType);
            pay.AddRequestData("vnp_ReturnUrl", urlCallBack);
            pay.AddRequestData("vnp_TxnRef", model.OrderId);

            return pay.CreateRequestUrl(_settings.BaseUrl, _settings.HashSecret);
        }

        public async Task<PaymentResponseModel> PaymentExecuteAsync(IQueryCollection collections, CancellationToken cancellationToken = default)
        {
            var pay = new VnPayLibrary();
            var callback = pay.GetFullResponseData(collections, _settings.HashSecret);

            if (string.IsNullOrWhiteSpace(callback.TxnRef))
            {
                callback.Success = false;
                callback.VnPayResponseCode = string.IsNullOrWhiteSpace(callback.VnPayResponseCode) ? "99" : callback.VnPayResponseCode;
                return callback;
            }

            var startedLocalTransaction = false;
            try
            {
                if (!_unitOfWork.HasActiveTransaction)
                {
                    await _unitOfWork.BeginTransactionAsync(cancellationToken);
                    startedLocalTransaction = true;
                }

                var paymentTransactionsRepo = _unitOfWork.BaseRepository<PaymentTransaction>();
                var nowUtc = DateTime.UtcNow;

                var inserted = await paymentTransactionsRepo.ExecuteCommandAsync(
                    "INSERT INTO \"PaymentTransactions\" (\"Id\", \"TxnRef\", \"Amount\", \"Status\", \"ResponseCode\", \"CreatedAt\", \"IsDeleted\", \"ConcurrencyToken\") " +
                    "VALUES ({0}, {1}, {2}, {3}, {4}, {5}, FALSE, {6}) " +
                    "ON CONFLICT (\"TxnRef\") DO NOTHING",
                    [Guid.NewGuid(), callback.TxnRef, callback.Amount, (int)PaymentTransactionStatus.Pending, callback.VnPayResponseCode, nowUtc, Guid.NewGuid().ToByteArray()],
                    cancellationToken);

                if (inserted == 0)
                {
                    var existing = await paymentTransactionsRepo.FirstOrDefaultAsync(x => x.TxnRef == callback.TxnRef, cancellationToken);
                    if (startedLocalTransaction)
                    {
                        await _unitOfWork.CommitTransactionAsync(cancellationToken);
                    }

                    return existing == null ? callback : MapFromExisting(callback, existing);
                }

                var order = await ResolveOrderFromTxnRef(callback.TxnRef, cancellationToken);
                if (order == null)
                {
                    await UpdatePaymentTransactionStatus(paymentTransactionsRepo, callback.TxnRef, PaymentTransactionStatus.Failed, "ORDER_NOT_FOUND", cancellationToken);
                    callback.Success = false;
                    callback.VnPayResponseCode = "ORDER_NOT_FOUND";

                    if (startedLocalTransaction)
                    {
                        await _unitOfWork.CommitTransactionAsync(cancellationToken);
                    }

                    return callback;
                }

                if (!callback.SignatureValid)
                {
                    await UpdatePaymentTransactionStatus(paymentTransactionsRepo, callback.TxnRef, PaymentTransactionStatus.Failed, "INVALID_SIGNATURE", cancellationToken);
                    callback.Success = false;
                    callback.VnPayResponseCode = "INVALID_SIGNATURE";

                    if (startedLocalTransaction)
                    {
                        await _unitOfWork.CommitTransactionAsync(cancellationToken);
                    }

                    return callback;
                }

                // A2: Anti-replay - kiểm tra thời gian tạo callback
                var createDateRaw = collections.FirstOrDefault(k => k.Key == "vnp_CreateDate").Value.ToString();
                if (!string.IsNullOrWhiteSpace(createDateRaw)
                    && DateTime.TryParseExact(createDateRaw, "yyyyMMddHHmmss",
                        CultureInfo.InvariantCulture, DateTimeStyles.None, out var createDateLocal))
                {
                    // vnp_CreateDate là giờ Việt Nam (UTC+7), chuyển về UTC
                    var vnTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
                    var createDateUtc = TimeZoneInfo.ConvertTimeToUtc(createDateLocal, vnTimeZone);
                    if (DateTime.UtcNow - createDateUtc > MaxCallbackAge)
                    {
                        await UpdatePaymentTransactionStatus(paymentTransactionsRepo, callback.TxnRef, PaymentTransactionStatus.Failed, "EXPIRED_CALLBACK", cancellationToken);
                        callback.Success = false;
                        callback.VnPayResponseCode = "EXPIRED_CALLBACK";

                        if (startedLocalTransaction)
                        {
                            await _unitOfWork.CommitTransactionAsync(cancellationToken);
                        }

                        return callback;
                    }
                }

                if (order.TotalAmount != callback.Amount)
                {
                    await UpdatePaymentTransactionStatus(paymentTransactionsRepo, callback.TxnRef, PaymentTransactionStatus.Failed, "AMOUNT_MISMATCH", cancellationToken);
                    callback.Success = false;
                    callback.VnPayResponseCode = "AMOUNT_MISMATCH";

                    if (startedLocalTransaction)
                    {
                        await _unitOfWork.CommitTransactionAsync(cancellationToken);
                    }

                    return callback;
                }

                if (callback.VnPayResponseCode == "00")
                {
                    var paymentExists = await _unitOfWork.BaseRepository<Payment>()
                        .AnyAsync(x => x.TransactionId == callback.TransactionId, cancellationToken);

                    if (!paymentExists)
                    {
                        var payment = new Payment
                        {
                            Id = Guid.NewGuid(),
                            OrderId = order.Id,
                            Amount = callback.Amount,
                            PaymentMethod = EPaymentMethod.VNPay,
                            TransactionId = string.IsNullOrWhiteSpace(callback.TransactionId) ? callback.TxnRef : callback.TransactionId,
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

                    await UpdatePaymentTransactionStatus(paymentTransactionsRepo, callback.TxnRef, PaymentTransactionStatus.Success, callback.VnPayResponseCode, cancellationToken);
                    callback.Success = true;
                }
                else
                {
                    await UpdatePaymentTransactionStatus(paymentTransactionsRepo, callback.TxnRef, PaymentTransactionStatus.Failed, callback.VnPayResponseCode, cancellationToken);
                    callback.Success = false;
                }

                await _unitOfWork.CompleteAsync(cancellationToken);

                if (startedLocalTransaction)
                {
                    await _unitOfWork.CommitTransactionAsync(cancellationToken);
                }

                return callback;
            }
            catch
            {
                if (startedLocalTransaction)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                }

                throw;
            }
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

        private async Task UpdatePaymentTransactionStatus(
            Ecommerce.Domain.Interfaces.Base.IRepository<PaymentTransaction> repository,
            string txnRef,
            PaymentTransactionStatus status,
            string responseCode,
            CancellationToken cancellationToken)
        {
            await repository.ExecuteCommandAsync(
                "UPDATE \"PaymentTransactions\" SET \"Status\" = {0}, \"ResponseCode\" = {1} WHERE \"TxnRef\" = {2}",
                [(int)status, responseCode, txnRef],
                cancellationToken);
        }

        private static PaymentResponseModel MapFromExisting(PaymentResponseModel callback, PaymentTransaction transaction)
        {
            callback.VnPayResponseCode = transaction.ResponseCode;
            callback.Success = transaction.Status == PaymentTransactionStatus.Success;
            callback.Amount = transaction.Amount;
            return callback;
        }
    }

    // Helper class for handling VNPay request construction and checksum
    public class VnPayLibrary
    {
        private readonly SortedList<string, string> _requestData = new(new VnPayCompare());
        private readonly SortedList<string, string> _responseData = new(new VnPayCompare());

        public void AddRequestData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                _requestData.Add(key, value);
            }
        }

        public void AddResponseData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                _responseData.Add(key, value);
            }
        }

        public string GetResponseData(string key)
        {
            return _responseData.TryGetValue(key, out var retValue) ? retValue : string.Empty;
        }

        public string CreateRequestUrl(string baseUrl, string vnp_HashSecret)
        {
            var data = new StringBuilder();
            var first = true;
            foreach (var kv in _requestData)
            {
                if (!first)
                {
                    data.Append("&");
                }

                data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value));
                first = false;
            }

            var queryString = data.ToString();
            var vnpSecureHash = HmacSHA512(vnp_HashSecret, queryString);
            var paymentUrl = baseUrl + "?" + queryString + "&vnp_SecureHash=" + vnpSecureHash;
            return paymentUrl;
        }

        public PaymentResponseModel GetFullResponseData(IQueryCollection collection, string hashSecret)
        {
            var vnPay = new VnPayLibrary();
            foreach (var (key, value) in collection)
            {
                if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
                {
                    vnPay.AddResponseData(key, value.ToString());
                }
            }

            var orderId = vnPay.GetResponseData("vnp_TxnRef");
            var vnPayTranId = vnPay.GetResponseData("vnp_TransactionNo");
            var vnpResponseCode = vnPay.GetResponseData("vnp_ResponseCode");
            var vnpSecureHash = collection.FirstOrDefault(k => k.Key == "vnp_SecureHash").Value;
            var orderInfo = vnPay.GetResponseData("vnp_OrderInfo");
            var rawAmount = vnPay.GetResponseData("vnp_Amount");

            _ = long.TryParse(rawAmount, out var amountInMinorUnit);
            var amount = amountInMinorUnit > 0 ? amountInMinorUnit / 100m : 0m;

            var checkSignature = vnPay.ValidateSignature(vnpSecureHash, hashSecret);

            return new PaymentResponseModel
            {
                Success = checkSignature && vnpResponseCode == "00",
                SignatureValid = checkSignature,
                PaymentMethod = "VnPay",
                OrderDescription = orderInfo,
                OrderId = orderId,
                TxnRef = orderId,
                TransactionId = vnPayTranId,
                Token = vnpSecureHash,
                VnPayResponseCode = vnpResponseCode,
                Amount = amount
            };
        }

        public bool ValidateSignature(string inputHash, string secretKey)
        {
            var rspRaw = GetResponseData();
            var myChecksum = HmacSHA512(secretKey, rspRaw);
            return myChecksum.Equals(inputHash, StringComparison.InvariantCultureIgnoreCase);
        }

        private string GetResponseData()
        {
            var data = new StringBuilder();
            if (_responseData.ContainsKey("vnp_SecureHashType"))
            {
                _ = _responseData.Remove("vnp_SecureHashType");
            }

            if (_responseData.ContainsKey("vnp_SecureHash"))
            {
                _ = _responseData.Remove("vnp_SecureHash");
            }

            foreach (var kv in _responseData)
            {
                if (!string.IsNullOrEmpty(kv.Value))
                {
                    data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
                }
            }

            if (data.Length > 0)
            {
                data.Remove(data.Length - 1, 1);
            }

            return data.ToString();
        }

        private static string HmacSHA512(string key, string inputData)
        {
            var hash = new StringBuilder();
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var inputBytes = Encoding.UTF8.GetBytes(inputData);
            using var hmac = new HMACSHA512(keyBytes);
            var hashValue = hmac.ComputeHash(inputBytes);
            foreach (var theByte in hashValue)
            {
                hash.Append(theByte.ToString("x2"));
            }

            return hash.ToString();
        }
    }

    public class VnPayCompare : IComparer<string>
    {
        public int Compare(string? x, string? y)
        {
            if (x == y) return 0;
            if (x == null) return -1;
            if (y == null) return 1;
            var vnpCompare = CompareInfo.GetCompareInfo("en-US");
            return vnpCompare.Compare(x, y, CompareOptions.Ordinal);
        }
    }

    public static class Utils
    {
        public static string GetIpAddress(HttpContext context)
        {
            var ipAddress = string.Empty;
            try
            {
                var remoteIpAddress = context.Connection.RemoteIpAddress;
                if (remoteIpAddress != null)
                {
                    if (remoteIpAddress.AddressFamily == System.Net.Sockets.AddressFamily.InterNetworkV6)
                    {
                        remoteIpAddress = System.Net.Dns.GetHostEntry(remoteIpAddress).AddressList
                            .FirstOrDefault(x => x.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork);
                    }

                    if (remoteIpAddress != null) ipAddress = remoteIpAddress.ToString();
                    return ipAddress;
                }
            }
            catch (Exception ex)
            {
                return "Invalid IP:" + ex.Message;
            }

            return "127.0.0.1";
        }
    }
}
