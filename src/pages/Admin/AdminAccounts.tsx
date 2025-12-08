import React, { useState, useEffect } from "react";
import "./AdminAccounts.css";
import apiClient from "../../services/api";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

interface User {
  id: number;
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  roleName: string;
  createdAt: string;
  updatedAt: string;
}

const AdminAccounts: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refreshUsers, setRefreshUsers] = useState(0);

  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    roleName: "",
  });

  const [editUser, setEditUser] = useState({
    id: 0,
    fullName: "",
    email: "",
    phoneNumber: "",
    roleName: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let response;
        if (selectedRole !== "all") {
          response = await apiClient.get(`/api/users/role/${selectedRole}`);
        } else {
          response = await apiClient.get("/api/users");
        }

        const usersData: User[] = response.data.map((user: any) => ({
          id: user.id,
          uid: user.uid,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          roleName: user.roleName,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }));

        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [selectedRole, refreshUsers]);

  const roleFilters = [
    { id: "all", name: "Tất cả", value: "all" },
    { id: "ADMIN", name: "Admin", value: "admin" },
    { id: "STAFF", name: "Staff", value: "staff" },
    { id: "USER", name: "User", value: "user" },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setNewUser({
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      roleName: "",
    });
  };

  const handleSaveNewUser = async () => {
    if (
      !newUser.fullName ||
      !newUser.email ||
      !newUser.password ||
      !newUser.phoneNumber ||
      !newUser.roleName
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (newUser.password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    try {
      const firebaseConfig = {
        apiKey: "AIzaSyANE_54S-4URk44n97LZCerYEvfDaWbUnU",
        authDomain: "restaurant-e7901.firebaseapp.com",
        projectId: "restaurant-e7901",
        appId: "1:1044243182093:web:bca76de63e7d24104bdb44",
      };

      const secondaryApp = initializeApp(firebaseConfig, "Secondary");
      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        newUser.email,
        newUser.password
      );

      const uid = userCredential.user.uid;
      await secondaryAuth.signOut();
      await deleteApp(secondaryApp);

      await apiClient.post("/api/users", {
        uid: uid,
        fullName: newUser.fullName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        roleName: newUser.roleName,
      });

      alert("Thêm thành công!");
      handleCloseModal();
      setRefreshUsers((prev) => prev + 1);
    } catch (error: any) {
      console.error("Error adding user:", error);
      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            alert("Email đã được sử dụng!");
            break;
          case "auth/invalid-email":
            alert("Email không hợp lệ!");
            break;
          case "auth/weak-password":
            alert("Mật khẩu quá yếu!");
            break;
          default:
            alert("Có lỗi xảy ra khi tạo tài khoản Firebase!");
        }
      } else {
        alert("Có lỗi xảy ra khi thêm!");
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditUser = (user: User) => {
    setEditUser({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      roleName: user.roleName,
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditUser({
      id: 0,
      fullName: "",
      email: "",
      phoneNumber: "",
      roleName: "",
    });
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEditUser = async () => {
    if (!editUser.fullName || !editUser.email || !editUser.phoneNumber) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const updateData = {
        fullName: editUser.fullName,
        email: editUser.email,
        phoneNumber: editUser.phoneNumber,
        roleName: editUser.roleName,
      };

      await apiClient.put(`/api/users/${editUser.id}`, updateData);

      alert("Cập nhật thông tin thành công!");
      handleCloseEditModal();
      setRefreshUsers((prev) => prev + 1);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Có lỗi xảy ra khi cập nhật!");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        await apiClient.delete(`/api/users/${userId}`);
        alert("Xóa người dùng thành công!");
        setRefreshUsers((prev) => prev + 1);
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Có lỗi xảy ra khi xóa người dùng!");
      }
    }
  };

  const getRoleLabel = (roleName: string) => {
    const roleMap: { [key: string]: string } = {
      ADMIN: "admin",
      STAFF: "staff",
      USER: "user",
    };
    return roleMap[roleName] || roleName;
  };

  return (
    <div className="admin-accounts">
      <div className="accounts-header">
        <h1>
          <i className="fas fa-users"></i> Quản lý Tài khoản Nhân viên
        </h1>
        <button className="btn-add-staff" onClick={handleAddUser}>
          <i className="fas fa-plus"></i> Thêm
        </button>
      </div>

      <div className="accounts-controls">
        <div className="search-and-filter">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="role-filters">
            {roleFilters.map((role) => (
              <button
                key={role.id}
                className={`role-btn ${
                  selectedRole === role.value ? "active" : ""
                }`}
                onClick={() => setSelectedRole(role.value)}
              >
                {role.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="accounts-table">
        <div className="table-header">
          <h3>Danh sách Nhân viên</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.fullName || "N/A"}</td>
                <td>{user.email || "N/A"}</td>
                <td>{user.phoneNumber || "N/A"}</td>
                <td>
                  <span
                    className={`role-badge ${
                      user.roleName?.toLowerCase() || ""
                    }`}
                  >
                    {getRoleLabel(user.roleName || "")}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-icon-btn edit"
                      onClick={() => handleEditUser(user)}
                      title="Chỉnh sửa"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="action-icon-btn delete"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Xóa"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-user-plus"></i> Thêm
              </h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>
                  Họ và tên <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên..."
                  value={newUser.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={newUser.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>
                  Mật khẩu <span className="required">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)..."
                  value={newUser.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Số điện thoại <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập số điện thoại..."
                  value={newUser.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Vai trò <span className="required">*</span>
                </label>
                <select
                  value={newUser.roleName}
                  onChange={(e) =>
                    handleInputChange("roleName", e.target.value)
                  }
                >
                  <option value="">-- Chọn vai trò --</option>
                  <option value="user">User</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>
                <i className="fas fa-times"></i> Hủy
              </button>
              <button className="btn-save" onClick={handleSaveNewUser}>
                <i className="fas fa-save"></i> Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-user-edit"></i> Chỉnh Sửa Thông Tin
              </h2>
              <button
                className="modal-close-btn"
                onClick={handleCloseEditModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>
                  Họ và tên <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên..."
                  value={editUser.fullName}
                  onChange={(e) =>
                    handleEditInputChange("fullName", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={editUser.email}
                  onChange={(e) =>
                    handleEditInputChange("email", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Số điện thoại <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập số điện thoại..."
                  value={editUser.phoneNumber}
                  onChange={(e) =>
                    handleEditInputChange("phoneNumber", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Vai trò</label>
                <select
                  value={editUser.roleName}
                  onChange={(e) =>
                    handleEditInputChange("roleName", e.target.value)
                  }
                >
                  <option value="user">User</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseEditModal}>
                <i className="fas fa-times"></i> Hủy
              </button>
              <button className="btn-save" onClick={handleSaveEditUser}>
                <i className="fas fa-save"></i> Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccounts;
