using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Reports.Queries.GetRecentTransactions
{
    public class GetRecentTransactionsQuery : IQuery<Result<List<RecentTransactionDto>>>
    {
        public int Limit { get; set; } = 5;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}

