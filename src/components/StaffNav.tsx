
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../layouts/StaffLayout.css";

const StaffNav: React.FC = () => {
  const location = useLocation();
  return (
    <nav className="sidebar-nav">
      <Link
        to="/staff/tables"
        className={`nav-item ${
          location.pathname === "/staff/tables" ? "active" : ""
        }`}
      >
        <i className="fas fa-chair"></i>
        <span>Quản Lý Bàn</span>
      </Link>
      <Link
        to="/staff/orders"
        className={`nav-item ${
          location.pathname === "/staff/orders" ? "active" : ""
        }`}
      >
        <i className="fas fa-receipt"></i>
        <span>Quản Lý Đơn Hàng</span>
      </Link>
    </nav>
  );
};

export default StaffNav;
