import React, { ReactNode } from "react";
import StaffHeader from "../components/StaffHeader";
import StaffNav from "../components/StaffNav";
import "./StaffLayout.css";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo.svg";

interface StaffLayoutProps {
  children: ReactNode;
}

const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="staff-layout">
      <aside className="staff-sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="sidebar-logo" />
          <h2>Nhân Viên</h2>
        </div>
        <StaffNav />
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="staff-main">
        <StaffHeader />
        <div className="staff-content">{children}</div>
      </main>
    </div>
  );
};

export default StaffLayout;