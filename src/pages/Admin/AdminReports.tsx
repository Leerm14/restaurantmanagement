import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";

interface RevenueReport {
  fromDate: string;
  toDate: string;
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  cashRevenue: number;
  cashTransactions: number;
  // Backend mapping: PayOS -> qrCodeRevenue
  qrCodeRevenue: number;
  qrCodeTransactions: number;
  // Các trường này hiện trả về 0 từ backend
  creditCardRevenue: number;
  creditCardTransactions: number;
}

interface MonthlyStats {
  year: number;
  month: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: {
    Pending: number;
    Confirmed: number;
    Completed: number;
    Cancelled: number;
  };
}

interface BestSellingItem {
  menuItemId: number;
  menuItemName: string;
  description: string;
  imageUrl: string;
  price: number;
  categoryName: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

const AdminReports: React.FC = () => {
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(
    null
  );
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [bestSelling, setBestSelling] = useState<BestSellingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const [fromDate, setFromDate] = useState(`${currentYear}-01-01`);
  const [toDate, setToDate] = useState(`${currentYear}-12-31`);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    loadRevenueReport();
  }, [fromDate, toDate]);

  useEffect(() => {
    loadMonthlyStats();
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    loadBestSelling();
  }, [limit]);

  const loadRevenueReport = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/api/payments/revenue-report", {
        params: { fromDate, toDate },
      });
      console.log("Revenue report response:", response.data);
      setRevenueReport(response.data);
    } catch (err: any) {
      console.error("Error loading revenue report:", err);
      setError(
        err.response?.data?.message || "Không thể tải báo cáo doanh thu"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyStats = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/api/orders/stats/monthly", {
        params: { year: selectedYear, month: selectedMonth },
      });
      console.log("Monthly stats response:", response.data);
      setMonthlyStats(response.data);
    } catch (err: any) {
      console.error("Error loading monthly stats:", err);
      setError(err.response?.data?.message || "Không thể tải thống kê tháng");
    } finally {
      setLoading(false);
    }
  };

  const loadBestSelling = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/api/menu/best-selling", {
        params: { limit },
      });
      setBestSelling(response.data);
    } catch (err: any) {
      console.error("Error loading best selling:", err);
      setError(err.response?.data?.message || "Không thể tải món bán chạy");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];
    return months[month - 1];
  };

  return (
    <div
      className="admin-reports"
      style={{ padding: "20px", maxWidth: "1600px", margin: "0 auto" }}
    >
      <h1 style={{ fontSize: "2rem", color: "#1f2937", marginBottom: "30px" }}>
        Thống kê & Báo cáo
      </h1>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#dc2626",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            borderLeft: "4px solid #dc2626",
          }}
        >
          {error}
        </div>
      )}

      {/* --- PHẦN 1: BỘ LỌC THÁNG/NĂM CHO THỐNG KÊ ĐƠN HÀNG --- */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <div>
          <label style={{ fontWeight: 600, marginRight: "10px" }}>Năm:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              padding: "10px 16px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
          >
            {[2023, 2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 600, marginRight: "10px" }}>Tháng:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{
              padding: "10px 16px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {getMonthName(month)}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={loadMonthlyStats}
          style={{
            padding: "10px 20px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Tải lại
        </button>
      </div>

      {/* --- HIỂN THỊ THỐNG KÊ ĐƠN HÀNG --- */}
      {monthlyStats && (
        <div style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              color: "#1f2937",
              marginBottom: "20px",
            }}
          >
            Đơn hàng {getMonthName(monthlyStats.month)} năm {monthlyStats.year}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "24px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
              }}
            >
              <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                Tổng đơn hàng
              </div>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  marginTop: "10px",
                }}
              >
                {monthlyStats.totalOrders}
              </div>
            </div>

            {monthlyStats.ordersByStatus && (
              <>
                <div
                  style={{
                    background: "#fef3c7",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ fontSize: "0.9rem", color: "#92400e" }}>
                    Chờ xác nhận
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#f59e0b",
                      marginTop: "5px",
                    }}
                  >
                    {monthlyStats.ordersByStatus.Pending || 0}
                  </div>
                </div>
                <div
                  style={{
                    background: "#dbeafe",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ fontSize: "0.9rem", color: "#1e3a8a" }}>
                    Đã xác nhận
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#3b82f6",
                      marginTop: "5px",
                    }}
                  >
                    {monthlyStats.ordersByStatus.Confirmed || 0}
                  </div>
                </div>
                <div
                  style={{
                    background: "#d1fae5",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ fontSize: "0.9rem", color: "#065f46" }}>
                    Hoàn thành
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#22c55e",
                      marginTop: "5px",
                    }}
                  >
                    {monthlyStats.ordersByStatus.Completed || 0}
                  </div>
                </div>
                <div
                  style={{
                    background: "#fee2e2",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ fontSize: "0.9rem", color: "#991b1b" }}>
                    Đã hủy
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#ef4444",
                      marginTop: "5px",
                    }}
                  >
                    {monthlyStats.ordersByStatus.Cancelled || 0}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- PHẦN 2: BỘ LỌC NGÀY CHO BÁO CÁO DOANH THU --- */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <div>
          <label style={{ fontWeight: 600, marginRight: "10px" }}>
            Từ ngày:
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              padding: "10px 16px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 600, marginRight: "10px" }}>
            Đến ngày:
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{
              padding: "10px 16px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
          />
        </div>
        <button
          onClick={loadRevenueReport}
          style={{
            padding: "10px 20px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Tải lại
        </button>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            fontSize: "1.2rem",
            color: "#6b7280",
          }}
        >
          Đang tải...
        </div>
      ) : (
        revenueReport && (
          <div style={{ marginBottom: "40px" }}>
            {/* --- TỔNG QUAN DOANH THU --- */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginBottom: "30px",
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  padding: "24px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                  Tổng giao dịch
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "bold",
                    marginTop: "10px",
                  }}
                >
                  {revenueReport.totalTransactions}
                </div>
              </div>

              <div
                style={{
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "white",
                  padding: "24px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                  Tổng doanh thu
                </div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    marginTop: "10px",
                  }}
                >
                  {formatCurrency(revenueReport.totalRevenue)}
                </div>
              </div>

              <div
                style={{
                  background:
                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  color: "white",
                  padding: "24px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                  Trung bình/giao dịch
                </div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    marginTop: "10px",
                  }}
                >
                  {formatCurrency(revenueReport.averageTransactionValue)}
                </div>
              </div>
            </div>

            {/* --- PHƯƠNG THỨC THANH TOÁN (Đã cập nhật) --- */}
            <div
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ marginBottom: "20px", color: "#1f2937" }}>
                Hiệu quả thanh toán
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "20px",
                }}
              >
                {/* 1. Tiền mặt */}
                <div
                  style={{
                    padding: "20px",
                    background: "#dcfce7",
                    borderRadius: "12px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1rem",
                      color: "#065f46",
                      fontWeight: 600,
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <i className="fas fa-money-bill-wave"></i> Tiền mặt
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#6b7280",
                      marginBottom: "5px",
                    }}
                  >
                    Giao dịch:{" "}
                    <span style={{ fontWeight: 600, color: "#374151" }}>
                      {revenueReport.cashTransactions}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: "bold",
                      color: "#22c55e",
                    }}
                  >
                    {formatCurrency(revenueReport.cashRevenue)}
                  </div>
                </div>

                {/* 2. PayOS (Mapping từ QR Code backend) */}
                <div
                  style={{
                    padding: "20px",
                    background: "#fef3c7",
                    borderRadius: "12px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    border: "1px solid #fde68a",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1rem",
                      color: "#92400e",
                      fontWeight: 600,
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <i className="fas fa-qrcode"></i> PayOS / Chuyển khoản
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#6b7280",
                      marginBottom: "5px",
                    }}
                  >
                    Giao dịch:{" "}
                    <span style={{ fontWeight: 600, color: "#374151" }}>
                      {revenueReport.qrCodeTransactions}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: "bold",
                      color: "#d97706",
                    }}
                  >
                    {formatCurrency(revenueReport.qrCodeRevenue)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* --- PHẦN 3: MÓN ĂN BÁN CHẠY --- */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", color: "#1f2937" }}>
            Món ăn bán chạy nhất
          </h2>
          <div>
            <label style={{ fontWeight: 600, marginRight: "10px" }}>
              Hiển thị:
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              style={{
                padding: "8px 12px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
            </select>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f3f4f6" }}>
              <tr>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontWeight: 600,
                  }}
                >
                  Hạng
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontWeight: 600,
                  }}
                >
                  Tên món
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontWeight: 600,
                  }}
                >
                  Danh mục
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "right",
                    fontWeight: 600,
                  }}
                >
                  Giá
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "right",
                    fontWeight: 600,
                  }}
                >
                  Đã bán
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "right",
                    fontWeight: 600,
                  }}
                >
                  Doanh thu
                </th>
              </tr>
            </thead>
            <tbody>
              {bestSelling.map((item, index) => (
                <tr
                  key={item.menuItemId}
                  style={{ borderTop: "1px solid #e5e7eb" }}
                >
                  <td style={{ padding: "16px" }}>
                    <span
                      style={{
                        background: index < 3 ? "#fbbf24" : "#e5e7eb",
                        color: index < 3 ? "white" : "#374151",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontWeight: "bold",
                      }}
                    >
                      #{index + 1}
                    </span>
                  </td>
                  <td style={{ padding: "16px", fontWeight: 600 }}>
                    {item.menuItemName}
                  </td>
                  <td style={{ padding: "16px", color: "#6b7280" }}>
                    {item.categoryName}
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    {formatCurrency(item.price)}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      textAlign: "right",
                      fontWeight: 600,
                      color: "#3b82f6",
                    }}
                  >
                    {item.totalQuantitySold}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      textAlign: "right",
                      fontWeight: 600,
                      color: "#22c55e",
                    }}
                  >
                    {formatCurrency(item.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
