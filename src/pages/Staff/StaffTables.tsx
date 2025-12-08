import React, { useState, useEffect } from "react";
import "./StaffTables.css";
import apiClient from "../../services/api";

interface Table {
  id: number;
  tableNumber: number;
  capacity: number;
  status: "Available" | "Booked" | "Used" | "Cleaning";
}

interface User {
  id: number;
  fullName: string;
  phoneNumber: string;
}

interface Booking {
  id: number;
  bookingTime: string;
  numGuests: number;
  status: "Confirmed" | "Pending" | "Cancelled" | "Completed";
  user: User;
}

const StaffTables: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTables, setRefreshTables] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTableBookings, setSelectedTableBookings] = useState<Booking[]>(
    []
  );
  const [currentTableId, setCurrentTableId] = useState<number | null>(null);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const openEditModal = (table: Table) => {
    alert(`Open edit for table ${table.tableNumber}`);
  };

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/api/tables");
        setTables(response.data);
      } catch (error) {
        console.error("Error fetching tables:", error);
        alert("Có lỗi khi tải danh sách bàn!");
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, [refreshTables]);

  const handleUpdateStatus = async (tableId: number, newStatus: string) => {
    try {
      await apiClient.patch(`/api/tables/${tableId}/status`, null, {
        params: { status: newStatus },
      });
      alert("Cập nhật trạng thái bàn thành công!");
      setRefreshTables((prev) => prev + 1);
    } catch (error) {
      console.error("Error updating table status:", error);
      alert("Có lỗi khi cập nhật trạng thái bàn!");
    }
  };
  const handleViewBookings = async (tableId: number) => {
    setCurrentTableId(tableId);
    setLoadingBookings(true);
    setShowBookingModal(true);
    try {
      const response = await apiClient.get(`/api/bookings/table/${tableId}`);
      const bookings: Booking[] = response.data.sort(
        (a: Booking, b: Booking) =>
          new Date(a.bookingTime).getTime() - new Date(b.bookingTime).getTime()
      );
      setSelectedTableBookings(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);

      alert("Không thể tải lịch đặt bàn!");
      setSelectedTableBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };
  const handleCheckInGuest = async (bookingId: number) => {
    if (!window.confirm("Xác nhận khách đã đến và nhận bàn?")) return;

    try {
      await apiClient.post(`/api/bookings/${bookingId}/check-in`);
      alert("Check-in thành công! Bàn đã chuyển sang trạng thái Đang dùng.");
      setShowBookingModal(false);
      setRefreshTables((prev) => prev + 1);
    } catch (error: any) {
      console.error("Check-in failed:", error);

      alert(error?.response?.data || "Lỗi khi check-in!");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "#22c55e";
      case "Booked":
        return "#3b82f6";
      case "Used":
        return "#f59e0b";
      case "Cleaning":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Available":
        return "Trống";
      case "Booked":
        return "Đã đặt";
      case "Used":
        return "Đang dùng";
      case "Cleaning":
        return "Dọn dẹp";
      default:
        return status;
    }
  };

  const statusOptions = [
    { value: "Available", label: "Trống" },
    { value: "Booked", label: "Đã đặt" },
    { value: "Used", label: "Đang dùng" },
    { value: "Cleaning", label: "Dọn dẹp" },
  ];

  if (loading) {
    return (
      <div className="staff-tables">
        <div className="staff-tables-loading-state">
          <i className="fas fa-spinner fa-spin"></i> Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="staff-tables">
      <div className="staff-content-card">
        <div className="tables-header">
          <h1>
            <i className="fas fa-chair"></i> Quản Lý Bàn
          </h1>
          <button
            className="btn-refresh"
            onClick={() => setRefreshTables((prev) => prev + 1)}
          >
            <i className="fas fa-sync-alt"></i> Làm mới
          </button>
        </div>

        <div className="tables-stats">
          <div className="stat-card available">
            <i className="fas fa-check-circle"></i>
            <div className="stat-info">
              <span className="stat-number">
                {tables.filter((t) => t.status === "Available").length}
              </span>
              <span className="stat-label">Bàn trống</span>
            </div>
          </div>
          <div className="stat-card occupied">
            <i className="fas fa-users"></i>
            <div className="stat-info">
              <span className="stat-number">
                {tables.filter((t) => t.status === "Used").length}
              </span>
              <span className="stat-label">Đang dùng</span>
            </div>
          </div>
          <div className="stat-card reserved">
            <i className="fas fa-bookmark"></i>
            <div className="stat-info">
              <span className="stat-number">
                {tables.filter((t) => t.status === "Booked").length}
              </span>
              <span className="stat-label">Đã đặt</span>
            </div>
          </div>
          <div className="stat-card cleaning">
            <i className="fas fa-broom"></i>
            <div className="stat-info">
              <span className="stat-number">
                {tables.filter((t) => t.status === "Cleaning").length}
              </span>
              <span className="stat-label">Đang dọn</span>
            </div>
          </div>
        </div>

        <div className="tables-grid">
          {tables.map((table) => (
            <div key={table.id} className="table-card">
              <div
                className="table-number"
                style={{ backgroundColor: getStatusColor(table.status) }}
              >
                <i className="fas fa-utensils"></i>
                <span>Bàn {table.tableNumber}</span>
              </div>
              <div className="table-info">
                <div className="table-capacity">
                  <i className="fas fa-user-friends"></i>
                  <span>{table.capacity} người</span>
                </div>
                <div
                  className="table-status"
                  style={{ color: getStatusColor(table.status) }}
                >
                  <i className="fas fa-circle"></i>
                  <span>{getStatusLabel(table.status)}</span>
                </div>
              </div>
              <div className="table-actions">
                <label>Cập nhật trạng thái:</label>
                <select
                  value={table.status}
                  onChange={(e) => handleUpdateStatus(table.id, e.target.value)}
                  className="staff-tables-status-select"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                  <button
                    className="btn-view-booking"
                    onClick={() => handleViewBookings(table.id)}
                    title="Xem lịch đặt bàn"
                    style={{
                      backgroundColor: "#8e44ad",
                      color: "white",
                      padding: "8px 12px",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <i className="fas fa-calendar-alt"></i> Lịch
                  </button>

                  <button
                    className="btn-edit"
                    onClick={() => openEditModal(table)}
                    disabled={loading}
                    style={{
                      backgroundColor: "#f3f4f6",
                      border: "1px solid #e5e7eb",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Sửa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {showBookingModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowBookingModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: 12,
                padding: 20,
                maxWidth: 700,
                width: "95%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <h2>
                  Lịch đặt bàn (Table #
                  {tables.find((t) => t.id === currentTableId)?.tableNumber})
                </h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>

              {loadingBookings ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  Đang tải...
                </div>
              ) : selectedTableBookings.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#666",
                  }}
                >
                  Không có lịch đặt nào cho bàn này.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
                        <th style={{ padding: "10px" }}>Khách hàng</th>
                        <th style={{ padding: "10px" }}>SĐT</th>
                        <th style={{ padding: "10px" }}>Thời gian</th>
                        <th style={{ padding: "10px" }}>Khách</th>
                        <th style={{ padding: "10px" }}>Trạng thái</th>
                        <th style={{ padding: "10px" }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTableBookings.map((booking) => (
                        <tr
                          key={booking.id}
                          style={{ borderBottom: "1px solid #eee" }}
                        >
                          <td style={{ padding: "10px" }}>
                            {booking.user?.fullName || "N/A"}
                          </td>
                          <td style={{ padding: "10px" }}>
                            {booking.user?.phoneNumber || "N/A"}
                          </td>
                          <td style={{ padding: "10px" }}>
                            {new Date(booking.bookingTime).toLocaleString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                              }
                            )}
                          </td>
                          <td style={{ padding: "10px" }}>
                            {booking.numGuests}
                          </td>
                          <td style={{ padding: "10px" }}>
                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "0.85rem",
                                backgroundColor:
                                  booking.status === "Confirmed"
                                    ? "#dbeafe"
                                    : booking.status === "Completed"
                                    ? "#d1fae5"
                                    : "#f3f4f6",
                                color:
                                  booking.status === "Confirmed"
                                    ? "#1e40af"
                                    : booking.status === "Completed"
                                    ? "#065f46"
                                    : "#374151",
                              }}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td style={{ padding: "10px" }}>
                            {(booking.status === "Confirmed" ||
                              booking.status === "Pending") && (
                              <button
                                onClick={() => handleCheckInGuest(booking.id)}
                                style={{
                                  backgroundColor: "#27ae60",
                                  color: "white",
                                  border: "none",
                                  padding: "6px 12px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                  fontSize: "0.85rem",
                                }}
                              >
                                <i className="fas fa-check"></i> Check-in
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffTables;
