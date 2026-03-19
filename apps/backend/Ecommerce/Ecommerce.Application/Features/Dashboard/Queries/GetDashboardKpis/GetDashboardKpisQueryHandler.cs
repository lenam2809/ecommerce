using Ecommerce.Application.Common.Helpers;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Dashboard.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Dashboard.Queries.GetDashboardKpis
{
    //[Authorize(Policy = "Dashboard:View")]
    public class GetDashboardKpisQueryHandler : IRequestHandler<GetDashboardKpisQuery, Result<List<DashboardKpiDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;
        private readonly IMapper _mapper;

        public GetDashboardKpisQueryHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _mapper = mapper;
        }

        public async Task<Result<List<DashboardKpiDto>>> Handle(GetDashboardKpisQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var today = DateTime.Today;
                var yesterday = today.AddDays(-1);

                // Lấy dữ liệu ngày hôm qua để so sánh
                var totalOrdersYesterday = await _unitOfWork.Orders
                    .CountAsync(o => o.CreatedAt.Date == yesterday, cancellationToken);

                var revenueYesterday = await _unitOfWork.Orders
                    .SumAsync(o => o.CreatedAt.Date == yesterday && o.Status == EOrderStatus.Completed,
                            o => o.TotalAmount, cancellationToken);

                var newUsersYesterday = await _unitOfWork.Users
                    .CountAsync(u => u.CreatedAt.Date == yesterday, cancellationToken);

                // Dữ liệu hôm nay
                var totalProducts = await _unitOfWork.Products.CountAsync(cancellationToken: cancellationToken);
                var totalOrdersToday = await _unitOfWork.Orders
                    .CountAsync(o => o.CreatedAt.Date == today, cancellationToken);
                var revenueToday = await _unitOfWork.Orders
                    .SumAsync(o => o.CreatedAt.Date == today && o.Status == EOrderStatus.Completed,
                            o => o.TotalAmount, cancellationToken);
                var processingOrders = await _unitOfWork.Orders
                    .CountAsync(o => o.Status == EOrderStatus.Processing, cancellationToken);
                var lowStockProducts = await _unitOfWork.Products
                    .CountAsync(p => p.StockQuantity < 10, cancellationToken);
                var newUsersToday = await _unitOfWork.Users
                    .CountAsync(u => u.CreatedAt.Date == today, cancellationToken);
                var totalUsers = await _unitOfWork.Users.CountAsync(cancellationToken: cancellationToken);
                var activePromoCodes = await _unitOfWork.PromoCodes
                    .CountAsync(pc => pc.IsActive, cancellationToken);

                // Tính toán xu hướng
                var orderTrendValue = CalculateTrendPercentage(totalOrdersToday, totalOrdersYesterday);
                var revenueTrendValue = CalculateTrendPercentage(revenueToday, revenueYesterday);
                var userTrendValue = CalculateTrendPercentage(newUsersToday, newUsersYesterday);


                var cards = new List<DashboardKpiDto>
                {
                    // Thẻ tổng sản phẩm
                    new DashboardKpiDto
                    {
                        Title = "Tổng sản phẩm",
                        Value = totalProducts.ToString(),
                        Description = "Tất cả sản phẩm trong kho",
                        Trend = new TrendData
                        {
                            Value = "0%",
                            Direction = "up"
                        },
                        Footer = new FooterData
                        {
                            Status = "ổn định",
                            Description = "So với tháng trước"
                        }
                    },
                    
                    // Thẻ đơn hàng hôm nay
                    new DashboardKpiDto
                    {
                        Title = "Đơn hàng hôm nay",
                        Value = totalOrdersToday.ToString(),
                        Description = "Đơn hàng được đặt trong ngày",
                        Trend = new TrendData
                        {
                            Value = orderTrendValue,
                            Direction = totalOrdersToday >= totalOrdersYesterday ? "up" : "down"
                        },
                        Footer = new FooterData
                        {
                            Status = totalOrdersToday >= totalOrdersYesterday ? "tăng" : "giảm",
                            Description = $"So với hôm qua ({totalOrdersYesterday})"
                        }
                    },


                    // Thẻ doanh thu hôm nay
                    new DashboardKpiDto
                    {
                        Title = "Doanh thu hôm nay",
                        Value = FormatHelper.ToVndCurrency(revenueToday),
                        Description = "Doanh thu từ đơn hàng đã hoàn thành",
                        Trend = new TrendData
                        {
                            Value = revenueTrendValue,
                            Direction = revenueToday >= revenueYesterday ? "up" : "down"
                        },
                        Footer = new FooterData
                        {
                            Status = revenueToday >= revenueYesterday ? "tăng" : "giảm",
                            Description = $"So với hôm qua ({revenueYesterday.ToString("C")})"
                        }
                    },
                    
                    // Thẻ đơn hàng đang xử lý
                    new DashboardKpiDto
                    {
                        Title = "Đơn hàng đang xử lý",
                        Value = processingOrders.ToString(),
                        Description = "Đơn hàng đang được xử lý",
                        Trend = new TrendData
                        {
                            Value = "0%",
                            Direction = "up"
                        },
                        Footer = new FooterData
                        {
                            Status = "cần kiểm tra",
                            Description = "Yêu cầu xem xét"
                        }
                    },
                    
                    // Thẻ sản phẩm sắp hết hàng
                    new DashboardKpiDto
                    {
                        Title = "Sản phẩm sắp hết",
                        Value = lowStockProducts.ToString(),
                        Description = "Sản phẩm có số lượng < 10",
                        Trend = new TrendData
                        {
                            Value = "0%",
                            Direction = "up"
                        },
                        Footer = new FooterData
                        {
                            Status = "cảnh báo",
                            Description = "Cần nhập thêm"
                        }
                    },
                    
                    // Thẻ người dùng mới
                    new DashboardKpiDto
                    {
                        Title = "Người dùng mới",
                        Value = newUsersToday.ToString(),
                        Description = "Người dùng đăng ký hôm nay",
                        Trend = new TrendData
                        {
                            Value = userTrendValue,
                            Direction = newUsersToday >= newUsersYesterday ? "up" : "down"
                        },
                        Footer = new FooterData
                        {
                            Status = newUsersToday >= newUsersYesterday ? "tăng" : "giảm",
                            Description = $"So với hôm qua ({newUsersYesterday})"
                        }
                    },
                    
                    // Thẻ mã khuyến mãi
                    new DashboardKpiDto
                    {
                        Title = "Mã khuyến mãi",
                        Value = activePromoCodes.ToString(),
                        Description = "Khuyến mãi đang hoạt động",
                        Trend = new TrendData
                        {
                            Value = "0%",
                            Direction = "up"
                        },
                        Footer = new FooterData
                        {
                            Status = "đang chạy",
                            Description = "Khuyến mãi hiện có"
                        }
                    },

                    // Thẻ mã khuyến mãi
                    new DashboardKpiDto
                    {
                        Title = "Tổng khách hàng",
                        Value = totalUsers.ToString(),
                        Description = "Khách hàng đang hoạt động",
                        Trend = new TrendData
                        {
                            Value = "0%",
                            Direction = "up"
                        },
                        Footer = new FooterData
                        {
                            Status = "ổn định",
                            Description = "So với tháng trước"
                        }
                    }
                };

                return Result<List<DashboardKpiDto>>.Success(cards);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Lỗi khi lấy dữ liệu KPI dashboard");
                return Result<List<DashboardKpiDto>>.BadRequest($"Lỗi khi lấy dữ liệu dashboard: {ex.Message}");
            }
        }

        private static string CalculateTrendPercentage(decimal todayValue, decimal yesterdayValue)
        {
            if (yesterdayValue == 0)
            {
                return todayValue == 0 ? "0%" : "∞%";
            }

            var change = todayValue - yesterdayValue;
            var percentage = (change / yesterdayValue) * 100;
            return $"{Math.Round(percentage, 1)}%";
        }
    }
}

