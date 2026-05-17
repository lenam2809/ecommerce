using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.Payments.Dto;
using Microsoft.Extensions.Options;
using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace Ecommerce.Infrastructure.Payments.VnPay;

public sealed class VnPayPaymentGateway : IPaymentGateway
{
    private const string VietnamTimeZoneId = "SE Asia Standard Time";
    private readonly VnPaySettings _settings;

    public VnPayPaymentGateway(IOptions<VnPaySettings> settings)
    {
        _settings = settings.Value;
    }

    public string CreatePaymentUrl(PaymentGatewayRequest request)
    {
        var timeZoneById = TimeZoneInfo.FindSystemTimeZoneById(VietnamTimeZoneId);
        var timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById);
        var pay = new VnPayLibrary();

        pay.AddRequestData("vnp_Version", _settings.Version);
        pay.AddRequestData("vnp_Command", "pay");
        pay.AddRequestData("vnp_TmnCode", _settings.TmnCode);
        pay.AddRequestData("vnp_Amount", ((long)(request.Amount * 100m)).ToString(CultureInfo.InvariantCulture));
        pay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture));
        pay.AddRequestData("vnp_CurrCode", "VND");
        pay.AddRequestData("vnp_IpAddr", string.IsNullOrWhiteSpace(request.ClientIpAddress) ? "127.0.0.1" : request.ClientIpAddress);
        pay.AddRequestData("vnp_Locale", "vn");
        pay.AddRequestData("vnp_OrderInfo", $"{request.CustomerName} {request.OrderDescription} {request.Amount}");
        pay.AddRequestData("vnp_OrderType", request.OrderType);
        pay.AddRequestData("vnp_ReturnUrl", _settings.ReturnUrl);
        pay.AddRequestData("vnp_TxnRef", request.TransactionRef);

        return pay.CreateRequestUrl(_settings.BaseUrl, _settings.HashSecret);
    }

    public PaymentGatewayCallback ParseCallback(IReadOnlyDictionary<string, string> parameters)
    {
        var vnPay = new VnPayLibrary();
        foreach (var (key, value) in parameters)
        {
            if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_", StringComparison.Ordinal))
            {
                vnPay.AddResponseData(key, value);
            }
        }

        var txnRef = vnPay.GetResponseData("vnp_TxnRef");
        var vnPayTranId = vnPay.GetResponseData("vnp_TransactionNo");
        var responseCode = vnPay.GetResponseData("vnp_ResponseCode");
        var secureHash = parameters.GetValueOrDefault("vnp_SecureHash", string.Empty);
        var orderInfo = vnPay.GetResponseData("vnp_OrderInfo");
        var rawAmount = vnPay.GetResponseData("vnp_Amount");

        _ = long.TryParse(rawAmount, out var amountInMinorUnit);
        var amount = amountInMinorUnit > 0 ? amountInMinorUnit / 100m : 0m;
        var signatureValid = vnPay.ValidateSignature(secureHash, _settings.HashSecret);

        return new PaymentGatewayCallback
        {
            Success = signatureValid && responseCode == "00",
            SignatureValid = signatureValid,
            PaymentMethod = "VnPay",
            OrderDescription = orderInfo,
            TransactionRef = txnRef,
            GatewayTransactionId = vnPayTranId,
            SecureHash = secureHash,
            GatewayResponseCode = responseCode,
            Amount = amount,
            CreatedAtUtc = ParseCreatedAtUtc(vnPay.GetResponseData("vnp_CreateDate"))
        };
    }

    private static DateTime? ParseCreatedAtUtc(string createDateRaw)
    {
        if (string.IsNullOrWhiteSpace(createDateRaw)
            || !DateTime.TryParseExact(
                createDateRaw,
                "yyyyMMddHHmmss",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var createDateLocal))
        {
            return null;
        }

        var vnTimeZone = TimeZoneInfo.FindSystemTimeZoneById(VietnamTimeZoneId);
        return TimeZoneInfo.ConvertTimeToUtc(createDateLocal, vnTimeZone);
    }
}

internal sealed class VnPayLibrary
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

    public string CreateRequestUrl(string baseUrl, string hashSecret)
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
        var secureHash = HmacSha512(hashSecret, queryString);
        return baseUrl + "?" + queryString + "&vnp_SecureHash=" + secureHash;
    }

    public bool ValidateSignature(string inputHash, string secretKey)
    {
        var responseData = GetResponseData();
        var checksum = HmacSha512(secretKey, responseData);
        return checksum.Equals(inputHash, StringComparison.InvariantCultureIgnoreCase);
    }

    private string GetResponseData()
    {
        var data = new StringBuilder();
        _responseData.Remove("vnp_SecureHashType");
        _responseData.Remove("vnp_SecureHash");

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

    private static string HmacSha512(string key, string inputData)
    {
        var hash = new StringBuilder();
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var inputBytes = Encoding.UTF8.GetBytes(inputData);
        using var hmac = new HMACSHA512(keyBytes);
        var hashValue = hmac.ComputeHash(inputBytes);
        foreach (var hashByte in hashValue)
        {
            hash.Append(hashByte.ToString("x2", CultureInfo.InvariantCulture));
        }

        return hash.ToString();
    }
}

internal sealed class VnPayCompare : IComparer<string>
{
    public int Compare(string? x, string? y)
    {
        if (x == y)
        {
            return 0;
        }

        if (x == null)
        {
            return -1;
        }

        if (y == null)
        {
            return 1;
        }

        var vnPayCompare = CompareInfo.GetCompareInfo("en-US");
        return vnPayCompare.Compare(x, y, CompareOptions.Ordinal);
    }
}
