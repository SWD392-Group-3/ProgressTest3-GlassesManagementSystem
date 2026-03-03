namespace BusinessLogicLayer.Constants
{
    /// <summary>
    /// Giá trị kết quả kiểm tra sản phẩm khi Operations nhận hàng đổi trả.
    /// Dùng cho ReturnExchangeItem.InspectionResult và cập nhật ProductVariant.Status / Prescription.Status.
    /// </summary>
    public static class InspectionResult
    {
        public const string Available = "Available";
        public const string Defective = "Defective";
        public const string Damaged = "Damaged";
        public const string NeedRepair = "NeedRepair";

        /// <summary>
        /// Danh sách giá trị hợp lệ cho validation.
        /// </summary>
        public static readonly string[] All = { Available, Defective, Damaged, NeedRepair };
    }
}
