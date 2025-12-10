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
                className={`table-number ${
                  table.status === "Available" ? "bg-green-500" :
                  table.status === "Booked" ? "bg-blue-500" :
                  table.status === "Used" ? "bg-amber-500" :
                  table.status === "Cleaning" ? "bg-red-500" : "bg-gray-500"
                }`}
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
                  className={`table-status ${
                    table.status === "Available" ? "text-green-500" :
                    table.status === "Booked" ? "text-blue-500" :
                    table.status === "Used" ? "text-amber-500" :
                    table.status === "Cleaning" ? "text-red-500" : "text-gray-500"
                  }`}
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
                <div className="mt-2 flex gap-2">
                  <button
                    className="btn-view-booking bg-purple-600 text-white px-3 py-2 border-none rounded-md cursor-pointer"
                    onClick={() => handleViewBookings(table.id)}
                    title="Xem lịch đặt bàn"
                  >
                    <i className="fas fa-calendar-alt"></i> Lịch
                  </button>

                  <button
                    className="btn-edit bg-gray-100 border border-gray-300 px-3 py-2 rounded-md cursor-pointer"
                    onClick={() => openEditModal(table)}
                    disabled={loading}
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
            className="modal-overlay fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]"
            onClick={() => setShowBookingModal(false)}
          >
            <div
              className="modal-content bg-white rounded-xl p-5 max-w-[700px] w-[95%]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between mb-5">
                <h2>
                  Lịch đặt bàn (Table #
                  {tables.find((t) => t.id === currentTableId)?.tableNumber})
                </h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="bg-transparent border-none text-2xl cursor-pointer"
                >
                  ×
                </button>
              </div>

              {loadingBookings ? (
                <div className="text-center p-5">
                  Đang tải...
                </div>
              ) : selectedTableBookings.length === 0 ? (
                <div className="text-center p-5 text-gray-600">
                  Không có lịch đặt nào cho bàn này.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="p-2.5">Khách hàng</th>
                        <th className="p-2.5">SĐT</th>
                        <th className="p-2.5">Thời gian</th>
                        <th className="p-2.5">Khách</th>
                        <th className="p-2.5">Trạng thái</th>
                        <th className="p-2.5">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTableBookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className="border-b border-gray-200"
                        >
                          <td className="p-2.5">
                            {booking.user?.fullName || "N/A"}
                          </td>
                          <td className="p-2.5">
                            {booking.user?.phoneNumber || "N/A"}
                          </td>
                          <td className="p-2.5">
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
                          <td className="p-2.5">
                            {booking.numGuests}
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                booking.status === "Confirmed"
                                  ? "bg-blue-100 text-blue-900"
                                  : booking.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="p-2.5">
                            {(booking.status === "Confirmed" ||
                              booking.status === "Pending") && (
                              <button
                                onClick={() => handleCheckInGuest(booking.id)}
                                className="bg-green-600 text-white border-none px-3 py-1.5 rounded cursor-pointer font-bold text-xs"
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
