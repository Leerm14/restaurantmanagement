import React, { useState, useEffect, FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Booking.css";
import Button from "../../../components/Button.tsx";
import apiClient from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { t } from "../../../utils/translations";

interface Table {
  id: number;
  tableNumber: number;
  capacity: number;
  status: "Available" | "Booked" | "Used" | "Cleaning";
}

const Booking: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [numGuests, setNumGuests] = useState<number>(2);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { userId } = useAuth();
  const { language } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const fromCart = location.state?.fromCart || false;

  useEffect(() => {
    const fetchTableAvailability = async () => {
      if (!selectedDate || !selectedTime) {
        loadDefaultTables();
        return;
      }

      setLoading(true);
      try {
        const dateTimeStr = `${selectedDate}T${selectedTime}:00`;
        const response = await apiClient.get("/api/tables/availability", {
          params: { time: dateTimeStr },
        });
        const tablesData = Array.isArray(response.data) ? response.data : [];
        console.log("Table availability data:", tablesData);
        const formattedTables: Table[] = tablesData.map((table: any) => ({
          id: table.id,
          tableNumber: table.tableNumber,
          capacity: table.capacity || 4,
          status: table.status,
        }));

        setTables(formattedTables);
        if (selectedTable) {
          const currentTable = formattedTables.find(
            (t) => t.id === selectedTable
          );
          if (currentTable && currentTable.status !== "Available") {
            setSelectedTable(null);
          }
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra bàn:", error);
        setError("Không thể tải trạng thái bàn cho giờ đã chọn");
      } finally {
        setLoading(false);
      }
    };

    const loadDefaultTables = async () => {
      try {
        const response = await apiClient.get("/api/tables", {
          params: { page: 0, size: 100 },
        });
        const tablesData = Array.isArray(response.data)
          ? response.data
          : response.data.content || [];

        const formattedTables: Table[] = tablesData.map((table: any) => ({
          id: table.id,
          tableNumber: table.tableNumber,
          capacity: table.capacity || 4,
          status: table.status,
        }));
        setTables(formattedTables);
      } catch (e) {
        console.error(e);
      }
    };

    fetchTableAvailability();
  }, [selectedDate, selectedTime]);

  const timeSlots: string[] = [
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
    "22:30",
  ];

  const handleTableSelect = (table: Table) => {
    if (table.status === "Available") {
      setSelectedTable(table.id);
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "Available":
        return t("available", language);
      case "Booked":
        return t("booked", language);
      case "Used":
        return t("using", language);
      case "Cleaning":
        return t("cleaning", language);
      default:
        return status;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!selectedDate) {
      setError("Vui lòng chọn ngày đặt bàn");
      return;
    }

    if (!selectedTime) {
      setError("Vui lòng chọn giờ đặt bàn");
      return;
    }

    if (!selectedTable) {
      setError("Vui lòng chọn bàn");
      return;
    }

    if (!userId) {
      setError("Vui lòng đăng nhập để đặt bàn");
      return;
    }

    if (numGuests < 1) {
      setError("Số khách phải ít nhất là 1");
      return;
    }

    setLoading(true);

    try {
      const bookingDateTime = `${selectedDate}T${selectedTime}:00`;

      const bookingDate = new Date(bookingDateTime);
      const now = new Date();
      if (bookingDate <= now) {
        setError("Thời gian đặt bàn phải là thời điểm trong tương lai");
        setLoading(false);
        return;
      }

      const requestData = {
        userId: Number(userId),
        tableId: selectedTable,
        bookingTime: bookingDateTime,
        numGuests: numGuests,
      };

      await apiClient.post("/api/bookings", requestData);

      alert("Đặt bàn thành công! Chúng tôi sẽ liên hệ với bạn sớm.");

      // Reset form
      setSelectedDate("");
      setSelectedTime("");
      setSelectedTable(null);
      setNumGuests(2);

      if (fromCart) {
        navigate("/cart");
      }
    } catch (err: any) {
      console.error("Error creating booking:", err);
      const errorMessage =
        err.response?.data?.message || "Không thể tạo đặt bàn";

      if (errorMessage.includes("not available")) {
        setError("Bàn này đã được đặt. Vui lòng chọn bàn khác.");
      } else if (errorMessage.includes("capacity")) {
        setError(
          "Số khách vượt quá sức chứa của bàn. Vui lòng chọn bàn lớn hơn."
        );
      } else if (
        errorMessage.includes("already booked") ||
        errorMessage.includes("conflict")
      ) {
        setError(
          "Thời gian này đã có người đặt. Vui lòng chọn thời gian khác."
        );
      } else if (errorMessage.includes("future")) {
        setError("Thời gian đặt bàn phải là thời điểm trong tương lai.");
      } else if (errorMessage.includes("user")) {
        setError("Không tìm thấy người dùng. Vui lòng đăng nhập lại.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="container">
        <div className="booking-header">
          <h1 className="booking-title">{t("bookingTitle", language)}</h1>
          <p className="booking-subtitle">
            {t("selectDate", language)}, {t("selectTime", language).toLowerCase()} {t("selectGuests", language).toLowerCase()}
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              borderRadius: "4px",
              color: "#c00",
            }}
          >
            {error}
          </div>
        )}

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="booking-form-section">
            <h3 className="booking-section-title">
              {t("selectDate", language)} <span style={{ color: "#ef4444" }}>*</span>
            </h3>
            <div className="booking-date-input">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="booking-date-picker"
              />
            </div>
          </div>

          <div className="booking-form-section">
            <h3 className="booking-section-title">
              {t("selectTime", language)} <span style={{ color: "#ef4444" }}>*</span>
            </h3>
            <div className="booking-time-slots">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  className={`booking-time-slot ${
                    selectedTime === time ? "selected" : ""
                  }`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="booking-form-section">
            <h3 className="booking-section-title">
              {t("selectTable", language)} <span style={{ color: "#ef4444" }}>*</span>
            </h3>
            <div className="booking-tables-grid">
              {tables.length === 0 ? (
                <p
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "#7f8c8d",
                  }}
                >
                  {selectedDate && selectedTime
                    ? t("availableTables", language)
                    : t("selectDate", language) + " " + t("selectTime", language).toLowerCase()}
                </p>
              ) : (
                tables.map((table) => (
                  <div
                    key={table.id}
                    className={`booking-table-item ${
                      table.status === "Available" ? "available" : "occupied"
                    } ${selectedTable === table.id ? "selected" : ""}`}
                    onClick={() => handleTableSelect(table)}
                    style={{
                      borderColor: getStatusColor(table.status),
                      cursor:
                        table.status === "Available"
                          ? "pointer"
                          : "not-allowed",
                      opacity: table.status === "Available" ? 1 : 0.6,
                    }}
                  >
                    <div className="booking-table-icon">🪑</div>
                    <span className="booking-table-name">
                      {t("tableNumber", language)} {table.tableNumber}
                    </span>
                    <span
                      className="booking-table-status"
                      style={{ color: getStatusColor(table.status) }}
                    >
                      {getStatusText(table.status)}
                    </span>
                    <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                      {table.capacity} {t("guests", language)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="booking-form-section">
            <h3 className="booking-section-title">{t("bookingInfo", language)}</h3>
            <div className="booking-customer-info">
              <div className="booking-form-group">
                <label>
                  {t("numGuests", language)} <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="number"
                  value={numGuests}
                  onChange={(e) => setNumGuests(Number(e.target.value))}
                  min="1"
                  max="20"
                  required
                />
              </div>
            </div>
          </div>

          <div className="booking-form-submit">
            <Button variant="primary" disabled={loading}>
              {loading ? t("processing", language) : t("confirmBooking", language)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Booking;
