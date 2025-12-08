import React, { useState, useEffect, useMemo } from "react";
import "./StaffOrders.css";
import apiClient from "../../services/api";

interface Payment {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: string;
  status: "Pending" | "Successful" | "Failed";
}

interface OrderItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  priceAtOrder: number;
  subtotal: number;
}

interface Order {
  id: number;
  userId: number;
  userFullName: string;
  tableId: number | null;
  tableName: string | null;
  totalAmount: number;
  status: string;
  orderType: string;
  createdAt: string;
  bookingTime?: string;
  orderItems: OrderItem[];
}

const StaffOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("Pending");

  const [searchType, setSearchType] = useState<"email" | "phone" | "table">(
    "email"
  );
  const [searchValue, setSearchValue] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const statusOptions = [
    { value: "Pending", label: "Chờ xử lý", color: "#f39c12" },
    { value: "Preparing", label: "Đang chuẩn bị", color: "#3498db" },
    { value: "Confirmed", label: "Sẵn sàng", color: "#9b59b6" },
    { value: "Completed", label: "Hoàn thành", color: "#27ae60" },
    { value: "Cancelled", label: "Đã hủy", color: "#e74c3c" },
  ];

  const safeData = (data: any) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    return [];
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      alert("Vui lòng nhập thông tin tìm kiếm!");
      return;
    }

    try {
      setLoading(true);
      let response;

      if (searchType === "email") {
        response = await apiClient.get("/api/orders/search/email", {
          params: { email: searchValue },
        });
      } else if (searchType === "phone") {
        response = await apiClient.get("/api/orders/search/phone", {
          params: { phone: searchValue },
        });
      } else if (searchType === "table") {
        response = await apiClient.get(`/api/orders/table/${searchValue}`);
      }

      setOrders(safeData(response?.data));
    } catch (error) {
      console.error("Error searching orders:", error);
      alert("Không tìm thấy đơn hàng!");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersByStatus = async (status: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/orders/status/${status}`);
      console.log("Fetched orders by status:", response.data);
      setOrders(safeData(response.data));
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const response = await apiClient.get("/api/payments/status/Pending");
      setPendingPayments(safeData(response.data));
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  useEffect(() => {
    if (!searchValue) {
      fetchOrdersByStatus(selectedStatus);
    }
    fetchPendingPayments();
    const interval = setInterval(fetchPendingPayments, 10000);
    return () => clearInterval(interval);
  }, [selectedStatus, searchValue]);

  const handleConfirmPayment = async (paymentId: number) => {
    if (!window.confirm("Xác nhận đã nhận đủ tiền mặt?")) return;
    try {
      await apiClient.patch(`/api/payments/${paymentId}/confirm`);
      alert("Xác nhận thanh toán thành công!");
      fetchPendingPayments();
      if (!searchValue) fetchOrdersByStatus(selectedStatus);
    } catch (error: any) {
      alert(
        "Lỗi xác nhận: " +
          (error.response?.data?.message || "Lỗi không xác định")
      );
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await apiClient.patch(`/api/orders/${orderId}/status`, {
        status: newStatus,
      });
      alert("Cập nhật trạng thái thành công!");
      if (!searchValue) fetchOrdersByStatus(selectedStatus);
    } catch (error) {
      alert("Lỗi cập nhật trạng thái");
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      try {
        await apiClient.patch(`/api/orders/${orderId}/cancel`);
        alert("Đã hủy đơn hàng thành công!");
        if (!searchValue) fetchOrdersByStatus(selectedStatus);
      } catch (error) {
        console.error("Error cancelling order:", error);
        alert("Có lỗi khi hủy đơn hàng!");
      }
    }
  };

  const getPaymentRequest = (orderId: number) => {
    return pendingPayments.find(
      (p) => p.orderId === orderId && p.status === "Pending"
    );
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const sortOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const hasPaymenta = pendingPayments.some(
        (p) => p.orderId === a.id && p.status === "Pending"
      );
      const hasPaymentb = pendingPayments.some(
        (p) => p.orderId === b.id && p.status === "Pending"
      );
      if (hasPaymenta && !hasPaymentb) return -1;
      if (!hasPaymenta && hasPaymentb) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [orders, pendingPayments]);

  const getStatusColor = (status: string) =>
    statusOptions.find((s) => s.value === status)?.color || "#95a5a6";
  const getStatusLabel = (status: string) =>
    statusOptions.find((s) => s.value === status)?.label || status;

  const getOrderTypeLabel = (type: string) => {
    switch (type) {
      case "Dinein":
        return "Tại chỗ";
      case "Takeaway":
        return "Mang đi";
      default:
        return type;
    }
  };

  return (
    <div className="staff-orders">
      <div className="staff-orders-content-card">
        <div className="staff-orders-header">
          <h1>
            <i className="fas fa-receipt"></i> Quản Lý Đơn Hàng
          </h1>

          {pendingPayments.length > 0 && (
            <div
              style={{
                backgroundColor: "#e74c3c",
                color: "white",
                padding: "12px 20px",
                borderRadius: "8px",
                marginTop: "15px",
                animation: "pulse 2s infinite",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <i className="fas fa-bell"></i>
              <span>
                Có {pendingPayments.length} bàn đang gọi thanh toán! Vui lòng
                kiểm tra các đơn hàng.
              </span>
            </div>
          )}
        </div>

        <div className="staff-orders-controls">
          <div className="staff-status-filters">
            <label>Lọc theo trạng thái:</label>
            <div className="staff-status-buttons">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  className={`staff-status-btn ${
                    selectedStatus === status.value ? "active" : ""
                  }`}
                  style={{
                    backgroundColor:
                      selectedStatus === status.value
                        ? status.color
                        : "transparent",
                    borderColor: status.color,
                    color:
                      selectedStatus === status.value ? "white" : status.color,
                  }}
                  onClick={() => {
                    setSelectedStatus(status.value);
                    setSearchValue("");
                  }}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <div className="staff-search-section">
            <label>Tìm kiếm đơn hàng:</label>
            <div className="staff-search-controls">
              <select
                value={searchType}
                onChange={(e) =>
                  setSearchType(e.target.value as "email" | "phone" | "table")
                }
                className="staff-search-type-select"
              >
                <option value="email">Email</option>
                <option value="phone">Số điện thoại</option>
                <option value="table">Số bàn</option>
              </select>
              <input
                type="text"
                placeholder={
                  searchType === "email"
                    ? "Nhập email..."
                    : searchType === "phone"
                    ? "Nhập số điện thoại..."
                    : "Nhập số bàn..."
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="staff-search-input"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className="staff-btn-search" onClick={handleSearch}>
                <i className="fas fa-search"></i> Tìm kiếm
              </button>
              {searchValue && (
                <button
                  className="staff-btn-search"
                  style={{ backgroundColor: "#6c757d", marginLeft: "10px" }}
                  onClick={() => {
                    setSearchValue("");
                    fetchOrdersByStatus(selectedStatus);
                  }}
                >
                  Hủy tìm
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="staff-loading-state">
            <i className="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="staff-empty-state">
            <i className="fas fa-inbox"></i>
            <p>Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="staff-orders-list">
            {sortOrders.map((order) => {
              const paymentRequest = getPaymentRequest(order.id);

              return (
                <div
                  key={order.id}
                  className="staff-order-card"
                  style={
                    paymentRequest
                      ? {
                          border: "2px solid #e74c3c",
                          backgroundColor: "#fff5f5",
                        }
                      : {}
                  }
                >
                  <div className="staff-order-header-card">
                    <div className="staff-order-info-main">
                      <h3>
                        <i className="fas fa-hashtag"></i> Đơn hàng #{order.id}
                        {paymentRequest && (
                          <span
                            style={{
                              color: "#e74c3c",
                              marginLeft: "10px",
                              fontSize: "0.85rem",
                              fontWeight: "bold",
                            }}
                          >
                            (KHÁCH GỌI TRẢ TIỀN)
                          </span>
                        )}
                      </h3>
                      <div className="staff-order-meta">
                        <span className="staff-order-type">
                          <i className="fas fa-concierge-bell"></i>{" "}
                          {getOrderTypeLabel(order.orderType)}
                        </span>
                        {order.tableName && (
                          <span className="staff-table-info">
                            <i className="fas fa-chair"></i> {order.tableName}
                          </span>
                        )}
                        {order.bookingTime ? (
                          <span
                            className="staff-order-date"
                            title="Giờ đặt bàn"
                          >
                            <i className="fas fa-calendar-alt"></i>{" "}
                            {formatDate(order.bookingTime)}
                          </span>
                        ) : (
                          <span
                            className="staff-order-date"
                            title="Giờ tạo đơn"
                          >
                            <i className="fas fa-clock"></i>{" "}
                            {formatDate(order.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className="staff-order-status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusLabel(order.status)}
                    </div>
                  </div>

                  <div className="staff-order-customer">
                    <div className="staff-customer-info">
                      <i className="fas fa-user"></i>{" "}
                      <span>{order.userFullName || "Khách lẻ"}</span>
                    </div>
                  </div>

                  {paymentRequest && (
                    <div
                      style={{
                        margin: "15px 0",
                        padding: "15px",
                        backgroundColor: "#fff",
                        border: "1px dashed #e74c3c",
                        borderRadius: "8px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontWeight: "bold",
                            color: "#c0392b",
                            margin: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <i className="fas fa-money-bill-wave"></i> Yêu cầu
                          thanh toán:
                        </p>
                        <p style={{ margin: "5px 0" }}>
                          Số tiền:{" "}
                          <strong style={{ fontSize: "1.1rem" }}>
                            {formatPrice(paymentRequest.amount)}
                          </strong>
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.9rem",
                            color: "#555",
                          }}
                        >
                          Phương thức:{" "}
                          <strong>
                            {paymentRequest.paymentMethod === "Cash"
                              ? "Tiền mặt"
                              : paymentRequest.paymentMethod}
                          </strong>
                        </p>
                      </div>
                      <button
                        onClick={() => handleConfirmPayment(paymentRequest.id)}
                        style={{
                          backgroundColor: "#27ae60",
                          color: "white",
                          padding: "10px 20px",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontWeight: "bold",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                        }}
                      >
                        <i className="fas fa-check-circle"></i> Xác nhận đã thu
                        tiền
                      </button>
                    </div>
                  )}

                  <div className="staff-order-items-section">
                    <button
                      className="staff-toggle-items-btn"
                      onClick={() =>
                        setExpandedOrder(
                          expandedOrder === order.id ? null : order.id
                        )
                      }
                    >
                      <i
                        className={`fas fa-chevron-${
                          expandedOrder === order.id ? "up" : "down"
                        }`}
                      ></i>
                      {expandedOrder === order.id
                        ? "Ẩn chi tiết"
                        : "Xem chi tiết"}{" "}
                      (món)
                    </button>

                    {expandedOrder === order.id && (
                      <div className="staff-order-items-list">
                        {order.orderItems &&
                          order.orderItems.map((item) => (
                            <div key={item.id} className="staff-order-item">
                              <span className="staff-item-name">
                                {item.quantity}x {item.menuItemName}
                              </span>
                              <span className="staff-item-price">
                                {formatPrice(item.subtotal)}
                              </span>
                            </div>
                          ))}
                        <div className="staff-order-total">
                          <span>Tổng cộng:</span>
                          <span className="staff-total-amount">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="staff-order-actions">
                    <div className="staff-status-update">
                      <label>Cập nhật trạng thái:</label>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateStatus(order.id, e.target.value)
                        }
                        className="staff-status-select"
                        disabled={order.status === "Cancelled"}
                      >
                        {statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {order.status !== "Cancelled" &&
                      order.status !== "Completed" && (
                        <button
                          className="staff-btn-cancel-order"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          <i className="fas fa-times-circle"></i> Hủy đơn hàng
                        </button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffOrders;
