import React, { useState, useEffect } from "react";
import "./AdminTables.css";
import apiClient from "../../services/api";

interface TableStats {
  Available: number;
  Booked: number;
  Used: number;
  Cleaning: number;
}

interface Table {
  id: number;
  tableNumber: number;
  capacity: number;
  status: "Available" | "Booked" | "Used" | "Cleaning";
}

interface CreateTableRequest {
  tableNumber: number;
  capacity: number;
  status: "Available" | "Booked" | "Used" | "Cleaning";
}

interface UpdateTableRequest {
  tableNumber?: number;
  capacity?: number;
  status?: "Available" | "Booked" | "Used" | "Cleaning";
}

const AdminTables: React.FC = () => {
  const [stats, setStats] = useState<TableStats>({
    Available: 0,
    Booked: 0,
    Used: 0,
    Cleaning: 0,
  });
  const [tables, setTables] = useState<Table[]>([]);
  const [filteredStatus, setFilteredStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState<CreateTableRequest>({
    tableNumber: 0,
    capacity: 2,
    status: "Available",
  });

  // Load thống kê và danh sách bàn khi component mount
  useEffect(() => {
    loadTableStats();
    loadTables();
  }, []);

  // Load lại danh sách bàn khi filter status thay đổi
  useEffect(() => {
    loadTables();
  }, [filteredStatus]);

  // API 0: Lấy thống kê số bàn
  const loadTableStats = async () => {
    try {
      const response = await apiClient.get("/api/tables/count");
      console.log("Stats response:", response.data);
      const byStatus = response.data.byStatus || {};
      setStats({
        Available: byStatus.Available || 0,
        Booked: byStatus.Booked || 0,
        Used: byStatus.Used || 0,
        Cleaning: byStatus.Cleaning || 0,
      });
    } catch (err: any) {
      console.error("Error loading table stats:", err);
      setError(err.response?.data?.message || "Không thể tải thống kê bàn");
    }
  };

  // API 1: Lấy danh sách bàn (có thể filter theo status)
  const loadTables = async () => {
    setLoading(true);
    setError("");
    try {
      const params = filteredStatus ? { status: filteredStatus } : {};
      const response = await apiClient.get("/api/tables", { params });
      setTables(response.data);
    } catch (err: any) {
      console.error("Error loading tables:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách bàn");
    } finally {
      setLoading(false);
    }
  };

  // API 3: Thêm bàn mới
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiClient.post("/api/tables", formData);
      setShowAddModal(false);
      setFormData({
        tableNumber: 0,
        capacity: 2,
        status: "Available",
      });
      loadTableStats();
      loadTables();
    } catch (err: any) {
      console.error("Error creating table:", err);
      setError(err.response?.data?.message || "Không thể thêm bàn mới");
    } finally {
      setLoading(false);
    }
  };

  // API 4: Cập nhật thông tin bàn
  const handleUpdateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;

    setLoading(true);
    setError("");
    try {
      const updateData: UpdateTableRequest = {
        tableNumber: formData.tableNumber,
        capacity: formData.capacity,
        status: formData.status,
      };
      await apiClient.put(`/api/tables/${selectedTable.id}`, updateData);
      setShowEditModal(false);
      setSelectedTable(null);
      loadTableStats();
      loadTables();
    } catch (err: any) {
      console.error("Error updating table:", err);
      setError(err.response?.data?.message || "Không thể cập nhật bàn");
    } finally {
      setLoading(false);
    }
  };

  // API 5: Sửa trạng thái bàn nhanh
  const handleQuickStatusChange = async (
    tableId: number,
    newStatus: "Available" | "Booked" | "Used" | "Cleaning"
  ) => {
    setLoading(true);
    setError("");
    try {
      await apiClient.patch(`/api/tables/${tableId}/status`, null, {
        params: { status: newStatus },
      });
      loadTableStats();
      loadTables();
    } catch (err: any) {
      console.error("Error updating table status:", err);
      setError(err.response?.data?.message || "Không thể cập nhật trạng thái");
    } finally {
      setLoading(false);
    }
  };

  // API 6: Xóa bàn
  const handleDeleteTable = async (tableId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bàn này?")) return;

    setLoading(true);
    setError("");
    try {
      await apiClient.delete(`/api/tables/${tableId}`);
      loadTableStats();
      loadTables();
    } catch (err: any) {
      console.error("Error deleting table:", err);
      setError(err.response?.data?.message || "Không thể xóa bàn");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (table: Table) => {
    setSelectedTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      status: table.status,
    });
    setShowEditModal(true);
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

  return (
    <div className="admin-tables">
      <div className="admin-tables-header">
        <h1>Quản lý bàn ăn</h1>
        <button className="btn-add-table" onClick={() => setShowAddModal(true)}>
          + Thêm bàn mới
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Thống kê */}
      <div className="table-stats">
        <div className="stat-card" style={{ borderColor: "#22c55e" }}>
          <h3>{stats.Available}</h3>
          <p>Bàn trống</p>
        </div>
        <div className="stat-card" style={{ borderColor: "#3b82f6" }}>
          <h3>{stats.Booked}</h3>
          <p>Đã đặt</p>
        </div>
        <div className="stat-card" style={{ borderColor: "#f59e0b" }}>
          <h3>{stats.Used}</h3>
          <p>Đang dùng</p>
        </div>
        <div className="stat-card" style={{ borderColor: "#ef4444" }}>
          <h3>{stats.Cleaning}</h3>
          <p>Dọn dẹp</p>
        </div>
      </div>

      {/* Filter */}
      <div className="table-filters">
        <label>Lọc theo trạng thái:</label>
        <select
          value={filteredStatus}
          onChange={(e) => setFilteredStatus(e.target.value)}
        >
          <option value="">Tất cả</option>
          <option value="Available">Trống</option>
          <option value="Booked">Đã đặt</option>
          <option value="Used">Đang dùng</option>
          <option value="Cleaning">Dọn dẹp</option>
        </select>
      </div>

      {/* Danh sách bàn */}
      {loading ? (
        <div className="admin-tables-loading">Đang tải...</div>
      ) : (
        <div className="tables-grid">
          {tables.map((table) => (
            <div
              key={table.id}
              className="table-card"
              style={{ borderColor: getStatusColor(table.status) }}
            >
              <div className="table-card-header">
                <h3>Bàn số {table.tableNumber}</h3>
                <span
                  className="table-status"
                  style={{ backgroundColor: getStatusColor(table.status) }}
                >
                  {getStatusText(table.status)}
                </span>
              </div>
              <div className="table-card-body">
                <p>
                  <strong>Sức chứa:</strong> {table.capacity} người
                </p>
              </div>
              <div className="table-card-actions">
                <select
                  value={table.status}
                  onChange={(e) =>
                    handleQuickStatusChange(table.id, e.target.value as any)
                  }
                  disabled={loading}
                >
                  <option value="Available">Trống</option>
                  <option value="Booked">Đã đặt</option>
                  <option value="Used">Đang dùng</option>
                  <option value="Cleaning">Dọn dẹp</option>
                </select>
                <button
                  className="btn-edit"
                  onClick={() => openEditModal(table)}
                  disabled={loading}
                >
                  Sửa
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteTable(table.id)}
                  disabled={loading}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal thêm bàn */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Thêm bàn mới</h2>
            <form onSubmit={handleAddTable}>
              <div className="form-group">
                <label>Số bàn:</label>
                <input
                  type="number"
                  required
                  value={formData.tableNumber || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tableNumber: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Sức chứa:</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value) || 2,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Trạng thái:</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as any,
                    })
                  }
                >
                  <option value="Available">Trống</option>
                  <option value="Booked">Đã đặt</option>
                  <option value="Used">Đang dùng</option>
                  <option value="Cleaning">Dọn dẹp</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" disabled={loading}>
                  {loading ? "Đang thêm..." : "Thêm bàn"}
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

      {/* Modal sửa bàn */}
      {showEditModal && selectedTable && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Sửa thông tin bàn #{selectedTable.tableNumber}</h2>
            <form onSubmit={handleUpdateTable}>
              <div className="form-group">
                <label>Số bàn:</label>
                <input
                  type="number"
                  required
                  value={formData.tableNumber || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tableNumber: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Sức chứa:</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value) || 2,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Trạng thái:</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as any,
                    })
                  }
                >
                  <option value="Available">Trống</option>
                  <option value="Booked">Đã đặt</option>
                  <option value="Used">Đang dùng</option>
                  <option value="Cleaning">Dọn dẹp</option>
                </select>
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

export default AdminTables;
