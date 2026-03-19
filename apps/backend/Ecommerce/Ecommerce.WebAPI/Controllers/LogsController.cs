using Ecommerce.Application.Features.AuditLogs.Queries.GetAuditLogById;
using Ecommerce.Application.Features.AuditLogs.Queries.GetAuditLogs;
using Ecommerce.Application.Features.AuditLogs.Queries.GetLogEntries;
using Ecommerce.Application.Features.AuditLogs.Queries.GetLogEntryById;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize] // Yêu cầu người dùng phải đăng nhập
    public class LogsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public LogsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách audit logs với phân quyền tự động
        /// </summary>
        /// <param name="query">Tham số truy vấn</param>
        /// <returns>Danh sách audit logs được phân trang</returns>
        [HttpGet("audit")]
        public async Task<IActionResult> GetAuditLogs([FromQuery] GetAuditLogsQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy danh sách system logs với phân quyền tự động
        /// </summary>
        /// <param name="query">Tham số truy vấn</param>
        /// <returns>Danh sách system logs được phân trang</returns>
        [HttpGet("system")]
        public async Task<IActionResult> GetSystemLogs([FromQuery] GetLogEntriesQuery query)
        {
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy audit log theo ID (chỉ Admin hoặc log của chính user)
        /// </summary>
        /// <param name="id">ID của audit log</param>
        /// <returns>Chi tiết audit log</returns>
        [HttpGet("audit/{id}")]
        public async Task<IActionResult> GetAuditLogById(Guid id)
        {
            var query = new GetAuditLogByIdQuery { Id = id };
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Lấy system log theo ID (chỉ Admin hoặc log của chính user)
        /// </summary>
        /// <param name="id">ID của system log</param>
        /// <returns>Chi tiết system log</returns>
        [HttpGet("system/{id}")]
        public async Task<IActionResult> GetSystemLogById(Guid id)
        {
            var query = new GetLogEntryByIdQuery { Id = id };
            var result = await _mediator.Send(query);
            return result.ToActionResult();
        }

        /// <summary>
        /// Xuất audit logs ra Excel (chỉ dành cho Admin)
        /// </summary>
        /// <param name="query">Tham số để lọc dữ liệu xuất</param>
        /// <returns>File Excel</returns>
        //[HttpGet("audit/export")]
        //[Authorize(Roles = "Admin")] // Chỉ Admin mới được xuất
        //public async Task<IActionResult> ExportAuditLogs([FromQuery] ExportAuditLogsQuery query)
        //{
        //    var result = await _mediator.Send(query);
        //    if (result.IsSuccess)
        //    {
        //        return File(result.Value.FileContent, result.Value.ContentType, result.Value.FileName);
        //    }
        //    return result.ToActionResult();
        //}

        /// <summary>
        /// Xuất system logs ra Excel (chỉ dành cho Admin)
        /// </summary>
        /// <param name="query">Tham số để lọc dữ liệu xuất</param>
        /// <returns>File Excel</returns>
        //[HttpGet("system/export")]
        //[Authorize(Roles = "Admin")] // Chỉ Admin mới được xuất
        //public async Task<IActionResult> ExportSystemLogs([FromQuery] ExportLogEntriesQuery query)
        //{
        //    var result = await _mediator.Send(query);
        //    if (result.IsSuccess)
        //    {
        //        return File(result.Value.FileContent, result.Value.ContentType, result.Value.FileName);
        //    }
        //    return result.ToActionResult();
        //}
    }
}

