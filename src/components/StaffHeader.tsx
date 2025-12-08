import React from "react";
import "../layouts/StaffLayout.css";

const StaffHeader: React.FC = () => (
  <header className="staff-header">
    <div className="staff-header-content">
      <h1>Hệ Thống Quản Lý Nhân Viên</h1>
      <div className="header-user">
        <i className="fas fa-user-circle"></i>
        <span>Nhân viên</span>
      </div>
    </div>
  </header>
);

export default StaffHeader;