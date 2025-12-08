import React, { useState, useEffect } from "react";
import "./AdminBooking.css";
import apiClient from "../../services/api";

interface Booking {
  id: number;
  userId: number;
  userName: string;
  tableId: number;
  tableName: string;
  tableNumber: number;
  bookingTime: string;
  numGuests: number;
  status: "Confirmed" | "Pending" | "Cancelled" | "Completed";
}

interface BookingCreateRequest {
  userId?: number;
  tableId: number;
  bookingTime: string;
  numGuests: number;
}

const AdminBooking: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize] = useState<number>(10);

  const [formData, setFormData] = useState<BookingCreateRequest>({
    userId: undefined,
    tableId: 0,
    bookingTime: "",
    numGuests: 2,
  });

  useEffect(() => {
    loadBookings();
  }, [currentPage, pageSize]);

  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/api/bookings", {
        params: { page: currentPage, size: pageSize },
      });
      const data = response.data;
      console.log("Fetched bookings:", data);
      let bookingsData = [];
      if (Array.isArray(data)) {
        bookingsData = data;
      } else if (data && Array.isArray(data.content)) {
        bookingsData = data.content;
      } else if (data && typeof data === "object") {
        bookingsData = [data];
      }

      const cleanedBookings = bookingsData.map((booking: any) => ({
        id: booking.id,
        userId: booking.user?.id || booking.userId,
        userName: booking.user?.fullName || booking.userName || "N/A",
        tableId: booking.table?.id || booking.tableId,
        tableName: booking.table?.name || booking.tableName || "N/A",
        tableNumber: booking.table?.tableNumber || booking.tableNumber || 0,
        bookingTime: booking.bookingTime,
        numGuests: booking.numGuests,
        status: booking.status,
      }));

      setBookings(cleanedBookings);
    } catch (err: any) {
      console.error("Error loading bookings:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách đặt bàn"
      );
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!formData.userId || formData.userId <= 0) {
        setError("Vui lòng nhập ID người dùng hợp lệ");
        setLoading(false);
        return;
      }
      if (!formData.tableId || formData.tableId <= 0) {
        setError("Vui lòng nhập ID bàn hợp lệ");
        setLoading(false);
        return;
      }
      const bookingDate = new Date(formData.bookingTime);
      const now = new Date();
      if (bookingDate <= now) {
        setError("Thời gian đặt bàn phải là thời điểm trong tương lai");
        setLoading(false);
        return;
      }
      if (formData.numGuests < 1) {
        setError("Số khách phải lớn hơn 0");
        setLoading(false);
        return;
      }
      let formattedTime = formData.bookingTime;
      if (
        formattedTime &&
        !formattedTime.includes(":", formattedTime.lastIndexOf(":"))
      ) {
        formattedTime = formattedTime + ":00";
      }

      const requestData = {
        ...formData,
        bookingTime: formattedTime,
        userId: Number(formData.userId),
      };
      await apiClient.post("/api/bookings", requestData);
      setShowAddModal(false);
      setFormData({
        userId: undefined,
        tableId: 0,
        bookingTime: "",
        numGuests: 2,
      });
      setError("");
      loadBookings();
    } catch (err: any) {
      console.error("Error creating booking:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data ||
        "Không thể tạo đặt bàn mới";
      if (typeof errorMsg === "string") {
        if (
          errorMsg.includes("not available") ||
          errorMsg.includes("not found")
        ) {
          setError(
            "Bàn không tồn tại hoặc không ở trạng thái Available (Trống)"
          );
        } else if (
          errorMsg.includes("capacity") ||
          errorMsg.includes("exceeds")
        ) {
          setError("Số khách vượt quá sức chứa của bàn");
        } else if (
          errorMsg.includes("already booked") ||
          errorMsg.includes("conflict")
        ) {
          setError("Bàn đã được đặt trong khoảng thời gian này");
        } else if (errorMsg.includes("future") || errorMsg.includes("past")) {
          setError("Thời gian đặt bàn phải là thời điểm trong tương lai");
        } else if (errorMsg.includes("user") || errorMsg.includes("User")) {
          setError("ID người dùng không tồn tại trong hệ thống");
        } else {
          setError(errorMsg);
        }
      } else {
        setError("Không thể tạo đặt bàn mới");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setLoading(true);
    setError("");
    try {
      if (!formData.tableId || formData.tableId <= 0) {
        setError("Vui lòng nhập ID bàn hợp lệ");
        setLoading(false);
        return;
      }

      const bookingDate = new Date(formData.bookingTime);
      const now = new Date();
      if (bookingDate <= now) {
        setError("Thời gian đặt bàn phải là thời điểm trong tương lai");
        setLoading(false);
        return;
      }

      if (formData.numGuests < 1) {
        setError("Số khách phải lớn hơn 0");
        setLoading(false);
        return;
      }

      let formattedTime = formData.bookingTime;
      if (
        formattedTime &&
        !formattedTime.includes(":", formattedTime.lastIndexOf(":"))
      ) {
        formattedTime = formattedTime + ":00";
      }

      const updateData = {
        ...formData,
        bookingTime: formattedTime,
      };

      await apiClient.put(`/api/bookings/${selectedBooking.id}`, updateData);
      setShowEditModal(false);
      setSelectedBooking(null);
      setError("");
      loadBookings();
    } catch (err: any) {
      console.error("Error updating booking:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data ||
        "Không thể cập nhật đặt bàn";

      if (typeof errorMsg === "string") {
        if (
          errorMsg.includes("not available") ||
          errorMsg.includes("not found")
        ) {
          setError(
            "Bàn không tồn tại hoặc không ở trạng thái Available (Trống)"
          );
        } else if (
          errorMsg.includes("capacity") ||
          errorMsg.includes("exceeds")
        ) {
          setError("Số khách vượt quá sức chứa của bàn");
        } else if (
          errorMsg.includes("already booked") ||
          errorMsg.includes("conflict")
        ) {
          setError("Bàn đã được đặt trong khoảng thời gian này");
        } else if (errorMsg.includes("future") || errorMsg.includes("past")) {
          setError("Thời gian đặt bàn phải là thời điểm trong tương lai");
        } else {
          setError(errorMsg);
        }
      } else {
        setError("Không thể cập nhật đặt bàn");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (id: number, status: string) => {
    const confirmMessages: { [key: string]: string } = {
      Confirmed: "Xác nhận đặt bàn này?",
      Completed: "Đánh dấu đặt bàn này là hoàn thành?",
      Cancelled: "Bạn có chắc chắn muốn hủy đặt bàn này?",
    };

    if (
      !window.confirm(
        confirmMessages[status] || "Xác nhận thay đổi trạng thái?"
      )
    )
      return;

    setLoading(true);
    setError("");
    try {
      await apiClient.patch(`/api/bookings/${id}/status`, null, {
        params: { status },
      });
      loadBookings();
    } catch (err: any) {
      console.error("Error updating booking status:", err);
      setError(
        err.response?.data?.message || `Không thể cập nhật trạng thái đặt bàn`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id: number) => {
    handleUpdateBookingStatus(id, "Cancelled");
  };

  const handleCompleteBooking = async (id: number) => {
    handleUpdateBookingStatus(id, "Completed");
  };

  const handleConfirmBooking = async (id: number) => {
    handleUpdateBookingStatus(id, "Confirmed");
  };

  const handleDeleteBooking = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đặt bàn này?")) return;

    setLoading(true);
    setError("");
    try {
      await apiClient.delete(`/api/bookings/${id}`);
      loadBookings();
    } catch (err: any) {
      console.error("Error deleting booking:", err);
      setError(err.response?.data?.message || "Không thể xóa đặt bàn");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByPhone = async () => {
    if (!searchTerm.trim()) {
      loadBookings();
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get(`/api/bookings/phone/${searchTerm}`);
      const data = response.data;

      let bookingsData = [];
      if (Array.isArray(data)) {
        bookingsData = data;
      } else if (data && Array.isArray(data.content)) {
        bookingsData = data.content;
      } else if (data && typeof data === "object") {
        bookingsData = [data];
      }

      const cleanedBookings = bookingsData.map((booking: any) => ({
        id: booking.id,
        userId: booking.user?.id || booking.userId,
        userName: booking.user?.fullName || booking.userName || "N/A",
        tableId: booking.table?.id || booking.tableId,
        tableName: booking.table?.name || booking.tableName || "N/A",
        tableNumber: booking.table?.tableNumber || booking.tableNumber || 0,
        bookingTime: booking.bookingTime,
        numGuests: booking.numGuests,
        status: booking.status,
      }));

      setBookings(cleanedBookings);
    } catch (err: any) {
      console.error("Error searching bookings:", err);
      setError(err.response?.data?.message || "Không tìm thấy đặt bàn");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setFormData({
      tableId: booking.tableId,
      bookingTime: booking.bookingTime,
      numGuests: booking.numGuests,
    });
    setError("");
    setShowEditModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "#f59e0b";
      case "Confirmed":
        return "#3b82f6";
      case "Completed":
        return "#22c55e";
      case "Cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Pending":
        return "Chờ xác nhận";
      case "Confirmed":
        return "Đã xác nhận";
      case "Completed":
        return "Hoàn thành";
      case "Cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchStatus =
      filterStatus === "all" || booking.status === filterStatus;
    const matchSearch =
      booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.tableName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="admin-booking">
      <div className="booking-header">
        <h1>Quản lý đặt bàn</h1>
        <button
          className="btn-add-booking"
          onClick={() => {
            setError("");
            setShowAddModal(true);
          }}
        >
          + Tạo đặt bàn mới
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="booking-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm theo tên khách hàng hoặc tên bàn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearchByPhone}>Tìm kiếm</button>
          <button onClick={loadBookings}>Làm mới</button>
        </div>

        <div className="filter-box">
          <label>Trạng thái:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="Pending">Chờ xác nhận</option>
            <option value="Confirmed">Đã xác nhận</option>
            <option value="Completed">Hoàn thành</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="admin-booking-loading">Đang tải...</div>
      ) : (
        <div className="bookings-table">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Khách hàng</th>
                <th>Tên bàn</th>
                <th>Số khách</th>
                <th>Thời gian đặt</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking, index) => (
                <tr key={booking.id}>
                  <td>{index + 1}</td>
                  <td>{booking.userName}</td>
                  <td>{`Số ${booking.tableNumber}`}</td>
                  <td>{booking.numGuests}</td>
                  <td>
                    {new Date(booking.bookingTime).toLocaleString("vi-VN")}
                  </td>
                  <td>
                    <span
                      className="booking-status-badge"
                      style={{
                        backgroundColor: getStatusColor(booking.status),
                      }}
                    >
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {booking.status === "Pending" && (
                        <>
                          <button
                            className="btn-confirm"
                            onClick={() => handleConfirmBooking(booking.id)}
                            title="Xác nhận đặt bàn"
                            style={{
                              backgroundColor: "#3b82f6",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              marginRight: "5px",
                            }}
                          >
                            ✓ Xác nhận
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={() => handleCancelBooking(booking.id)}
                            title="Hủy đặt bàn"
                            style={{
                              backgroundColor: "#ef4444",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              marginRight: "5px",
                            }}
                          >
                            ✕ Hủy
                          </button>
                        </>
                      )}
                      {booking.status === "Confirmed" && (
                        <>
                          <button
                            className="btn-complete"
                            onClick={() => handleCompleteBooking(booking.id)}
                            title="Đánh dấu hoàn thành"
                            style={{
                              backgroundColor: "#22c55e",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              marginRight: "5px",
                            }}
                          >
                            ✓ Hoàn thành
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={() => handleCancelBooking(booking.id)}
                            title="Hủy đặt bàn"
                            style={{
                              backgroundColor: "#ef4444",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              marginRight: "5px",
                            }}
                          >
                            ✕ Hủy
                          </button>
                        </>
                      )}
                      {booking.status === "Pending" && (
                        <button
                          className="btn-edit"
                          onClick={() => openEditModal(booking)}
                          disabled={loading}
                          style={{
                            backgroundColor: "#f59e0b",
                            color: "white",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            marginRight: "5px",
                          }}
                        >
                          ✏ Sửa
                        </button>
                      )}
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteBooking(booking.id)}
                        disabled={loading}
                        style={{
                          backgroundColor: "#6b7280",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        🗑 Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
        >
          ← Trước
        </button>
        <span>Trang {currentPage + 1}</span>
        <button onClick={() => setCurrentPage((prev) => prev + 1)}>
          Sau →
        </button>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Tạo đặt bàn mới</h2>
            {error && (
              <div className="error-message" style={{ marginBottom: "15px" }}>
                {error}
              </div>
            )}
            <form onSubmit={handleAddBooking}>
              <div className="form-group">
                <label>ID người dùng:</label>
                <input
                  type="number"
                  required
                  value={formData.userId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      userId: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="Nhập ID người dùng"
                />
              </div>
              <div className="form-group">
                <label>Số bàn:</label>
                <input
                  type="number"
                  required
                  value={formData.tableId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tableId: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Số khách:</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.numGuests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numGuests: parseInt(e.target.value) || 2,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Thời gian đặt:</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.bookingTime}
                  onChange={(e) =>
                    setFormData({ ...formData, bookingTime: e.target.value })
                  }
                />
              </div>
              <div className="modal-actions">
                <button type="submit" disabled={loading}>
                  {loading ? "Đang tạo..." : "Tạo đặt bàn"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={loading}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Sửa đặt bàn #{selectedBooking.id}</h2>
            {error && (
              <div className="error-message" style={{ marginBottom: "15px" }}>
                {error}
              </div>
            )}
            <form onSubmit={handleUpdateBooking}>
              <div className="form-group">
                <label>Số bàn:</label>
                <input
                  type="number"
                  required
                  value={formData.tableId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tableId: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Số khách:</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.numGuests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numGuests: parseInt(e.target.value) || 2,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Thời gian đặt:</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.bookingTime}
                  onChange={(e) =>
                    setFormData({ ...formData, bookingTime: e.target.value })
                  }
                />
              </div>
              <div className="modal-actions">
                <button type="submit" disabled={loading}>
                  {loading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={loading}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooking;
