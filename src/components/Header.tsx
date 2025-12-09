import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Components.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import logo from "../assets/logo.svg";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { getTotalItems } = useCart();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="logo">
            <img src={logo} alt="Logo" />
          </div>

          <nav className="nav-menu">
            <Link to="/" className="nav-link">
              Trang chủ
            </Link>
            <Link to="/menu" className="nav-link">
              Menu
            </Link>
            <Link to="/booking" className="nav-link">
              Đặt bàn
            </Link>
            <Link to="/order-history" className="nav-link">
              Lịch sử đơn hàng
            </Link>
            <Link to="/cart" className="nav-link cart-link">
              <i className="fa-solid fa-shopping-cart"></i>
              Giỏ hàng
              {getTotalItems() > 0 && (
                <span className="cart-badge">{getTotalItems()}</span>
              )}
            </Link>
          </nav>

          <div className="account-section">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="account-button">
                <i className="fa-solid fa-right-from-bracket"></i>
                <span>Đăng xuất</span>
              </button>
            ) : (
              <Link to="/signin" className="account-button">
                <i className="fa-regular fa-circle-user"></i>
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
