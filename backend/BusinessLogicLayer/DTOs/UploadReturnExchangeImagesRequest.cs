using Microsoft.AspNetCore.Http;

namespace BusinessLogicLayer.DTOs
{
    public class UploadReturnExchangeImagesRequest
    {
        public Guid ReturnExchangeItemId { get; set; }
        public List<IFormFile> Images { get; set; } = new();
        public string? Description { get; set; }
    }
}
