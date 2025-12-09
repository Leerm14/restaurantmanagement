import React from "react";
import "./Components.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-nav">
            <a href="#" className="footer-nav-link">
              Sản phẩm
            </a>
            <a href="#" className="footer-nav-link">
              Thông tin
            </a>
          </div>

          <div className="footer-social">
            <a href="#" className="footer-social-link">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="footer-social-link">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="footer-social-link">
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
