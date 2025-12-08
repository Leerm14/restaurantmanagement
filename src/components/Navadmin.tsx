import React, { useState, useEffect } from "react";
import "./Components.css";
import { Link, useLocation } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface NavAdminProps {
  onMenuSelect?: (menu: string) => void;
  activeMenu?: string;
}

const Navadmin: React.FC<NavAdminProps> = ({ onMenuSelect, activeMenu }) => {
  const location = useLocation();
  const [selectedMenu, setSelectedMenu] = useState(activeMenu || "accounts");

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath.includes("/admin/menu")) {
      setSelectedMenu("menu");
    } else if (currentPath.includes("/admin/tables")) {
      setSelectedMenu("tables");
    } else if (currentPath.includes("/admin/reports")) {
      setSelectedMenu("reports");
    } else if (currentPath.includes("/admin/booking")) {
      setSelectedMenu("booking");
    } else if (currentPath.includes("/admin/accounts")) {
      setSelectedMenu("accounts");
    }
  }, [location.pathname]);

  const menuItems = [
    {
      id: "accounts",
      label: "Quản lý tài khoản",
      icon: "fas fa-user-cog",
      to: "/admin/accounts",
    },
    {
      id: "menu",
      label: "Quản lý menu",
      icon: "fas fa-utensils",
      to: "/admin/menu",
    },
    {
      id: "tables",
      label: "Quản lý bàn",
      icon: "fas fa-table",
      to: "/admin/tables",
    },
    {
      id: "reports",
      label: "Thống kê & Báo cáo",
      icon: "fas fa-chart-line",
      to: "/admin/reports",
    },
    {
      id: "booking",
      label: "Đặt bàn",
      icon: "fas fa-calendar-check",
      to: "/admin/booking",
    },
  ];

  const handleMenuClick = (menuId: string) => {
    setSelectedMenu(menuId);
    if (onMenuSelect) {
      onMenuSelect(menuId);
    }
  };

  return (
    <nav className="nav-admin">
      <div className="nav-admin-header">
        <h2>Admin Panel</h2>
      </div>
      <ul className="nav-admin-menu">
        {menuItems.map((item) => (
          <li key={item.id} className="nav-admin-item">
            <Link
              to={item.to}
              className={`nav-admin-button ${
                selectedMenu === item.id ? "active" : ""
              }`}
              onClick={() => handleMenuClick(item.id)}
            >
              <i className={`nav-admin-icon ${item.icon}`}></i>
              <span className="nav-admin-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navadmin;
