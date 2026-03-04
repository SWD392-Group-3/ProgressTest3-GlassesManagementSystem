using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using BusinessLogicLayer.DTOs.Request;
using BusinessLogicLayer.DTOs.Response;
using BusinessLogicLayer.Services.Interfaces;
using BusinessLogicLayer.Settings;
using Microsoft.Extensions.Options;

namespace BusinessLogicLayer.Services.Implementations
{
    public class MomoService : IMomoService
    {
        private readonly MomoSettings _settings;
        private readonly HttpClient _httpClient;

        public MomoService(IOptions<MomoSettings> settings, HttpClient httpClient)
        {
            _settings = settings.Value;
            _httpClient = httpClient;
        }

        public async Task<MomoCreatePaymentResponse> CreatePaymentAsync(MomoCreatePaymentRequest request)
        {
            var requestId = Guid.NewGuid().ToString();
            var orderId = request.OrderId.ToString();
            var orderInfo = request.OrderInfo ?? $"Thanh toán đơn hàng {orderId}";
            var amount = request.Amount;
            var extraData = "";

            // Tạo raw signature theo chuẩn Momo v2
            var rawHash =
                $"accessKey={_settings.AccessKey}" +
                $"&amount={amount}" +
                $"&extraData={extraData}" +
                $"&ipnUrl={_settings.NotifyUrl}" +
                $"&orderId={orderId}" +
                $"&orderInfo={orderInfo}" +
                $"&partnerCode={_settings.PartnerCode}" +
                $"&redirectUrl={_settings.ReturnUrl}" +
                $"&requestId={requestId}" +
                $"&requestType={_settings.RequestType}";

            var signature = ComputeHmacSha256(rawHash, _settings.SecretKey);

            var payload = new
            {
                partnerCode = _settings.PartnerCode,
                partnerName = "GlassesManagementSystem",
                storeId = _settings.PartnerCode,
                requestId,
                amount,
                orderId,
                orderInfo,
                redirectUrl = _settings.ReturnUrl,
                ipnUrl = _settings.NotifyUrl,
                lang = "vi",
                requestType = _settings.RequestType,
                autoCapture = true,
                extraData,
                signature
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var httpResponse = await _httpClient.PostAsync(_settings.MomoApiUrl, content);
            var responseBody = await httpResponse.Content.ReadAsStringAsync();

            var momoResponse = JsonSerializer.Deserialize<JsonElement>(responseBody);

            return new MomoCreatePaymentResponse
            {
                ResultCode = momoResponse.GetProperty("resultCode").GetInt32(),
                Message = momoResponse.GetProperty("message").GetString() ?? "",
                PayUrl = momoResponse.TryGetProperty("payUrl", out var payUrlProp)
                    ? payUrlProp.GetString() ?? ""
                    : "",
                OrderId = orderId,
                RequestId = requestId,
                Amount = amount
            };
        }

        public bool ValidateCallback(MomoCallbackResponse callback)
        {
            // Tái tạo rawHash theo đúng thứ tự field Momo yêu cầu
            var rawHash =
                $"accessKey={_settings.AccessKey}" +
                $"&amount={callback.Amount}" +
                $"&extraData={callback.ExtraData ?? ""}" +
                $"&message={callback.Message}" +
                $"&orderId={callback.OrderId}" +
                $"&orderInfo={callback.OrderInfo}" +
                $"&orderType={callback.OrderType}" +
                $"&partnerCode={callback.PartnerCode}" +
                $"&payType={callback.PayType}" +
                $"&requestId={callback.RequestId}" +
                $"&responseTime={callback.ResponseTime}" +
                $"&resultCode={callback.ResultCode}" +
                $"&transId={callback.TransId}";

            var expectedSignature = ComputeHmacSha256(rawHash, _settings.SecretKey);
            return string.Equals(expectedSignature, callback.Signature, StringComparison.OrdinalIgnoreCase);
        }

        private static string ComputeHmacSha256(string message, string secretKey)
        {
            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            var messageBytes = Encoding.UTF8.GetBytes(message);
            using var hmac = new HMACSHA256(keyBytes);
            var hashBytes = hmac.ComputeHash(messageBytes);
            return Convert.ToHexString(hashBytes).ToLower();
        }
    }
}
