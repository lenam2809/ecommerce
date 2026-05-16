using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using Ecommerce.Domain.Enums;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Orders.Queries.GetOrders
{
    public class GetOrdersQuery : IQuery<Result<PaginatedList<OrderDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SearchTerm { get; set; } = string.Empty;
        public Guid? UserId { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public EOrderStatus? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? MinTotalAmount { get; set; }
        public decimal? MaxTotalAmount { get; set; }
        public string SortBy { get; set; } = "orderDate";
        public bool IsDescending { get; set; } = true;
    }
}

