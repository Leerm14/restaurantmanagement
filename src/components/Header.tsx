import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Components.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import { t } from "../utils/translations";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import apiClient from "../services/api";
import logo from "../assets/logo.png";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { getTotalItems } = useCart();
  const { language } = useTheme();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    fullName: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isAuthenticated) {
        try {
          const response = await apiClient.get("/api/users/me");
          setUserInfo({
            fullName: response.data.fullName,
            email: response.data.email,
          });
        } catch (error) {
          console.error(error);
        }
      }
    };

    if (isAuthenticated) {
      fetchUserInfo();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      navigate("/signin");
      setIsAccountMenuOpen(false);
    } catch (error) {
      console.error(error);
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
              {t("home", language)}
            </Link>
            <Link to="/menu" className="nav-link">
              {t("menu", language)}
            </Link>
            <Link to="/booking" className="nav-link">
              {t("booking", language)}
            </Link>
            <Link to="/order-history" className="nav-link">
              {t("orderHistory", language)}
            </Link>
          </nav>

          <div className="account-section">
            <Link to="/cart" className="icon-button cart-icon">
              <i className="fa-solid fa-shopping-cart"></i>
              {getTotalItems() > 0 && (
                <span className="cart-badge">{getTotalItems()}</span>
              )}
            </Link>

            <div className="account-dropdown">
              <button
                className="icon-button account-icon-btn"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              >
                <i className="fa-regular fa-circle-user"></i>
              </button>

              {isAccountMenuOpen && (
                <div className="dropdown-menu">
                  {isAuthenticated ? (
                    <>
                      <div className="dropdown-user-info">
                        <div className="user-avatar">
                          <i className="fa-solid fa-user"></i>
                        </div>
                        <div className="user-details">
                          <div className="user-name">
                            {userInfo?.fullName || "User"}
                          </div>
                          <div className="user-email">
                            {userInfo?.email || ""}
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/account"
                        className="dropdown-item"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        <i className="fa-solid fa-user"></i>
                        <span>{t("accountTitle", language)}</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="dropdown-item"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        <i className="fa-solid fa-cog"></i>
                        <span>{t("settings", language)}</span>
                      </Link>
                      <button
                        className="dropdown-item logout-item"
                        onClick={handleLogout}
                      >
                        <i className="fa-solid fa-right-from-bracket"></i>
                        <span>{t("logout", language)}</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/signin"
                      className="dropdown-item"
                      onClick={() => setIsAccountMenuOpen(false)}
                    >
                      <i className="fa-regular fa-circle-user"></i>
                      <span>Đăng nhập</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;