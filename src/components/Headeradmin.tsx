import React from "react";
import { useNavigate } from "react-router-dom";
import "./Components.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import logo from "../assets/logo.svg";

const HeaderAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, logout } = useAuth();

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
          <div className="account-section">
            <button onClick={handleLogout} className="account-button">
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Đăng xuất {userRole && `(${userRole})`}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;
