using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Manager;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IComboService
    {
        /// <summary>Lấy danh sách tất cả combo (kèm items: kính + tròng kính)</summary>
        Task<IEnumerable<ComboDto>> GetAllCombosAsync();

        /// <summary>Lấy chi tiết một combo theo Id</summary>
        Task<ComboDto?> GetComboByIdAsync(Guid id);
    }
}
