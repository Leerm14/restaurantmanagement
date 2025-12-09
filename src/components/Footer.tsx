import React from "react";
import "./Components.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import logo from "../assets/logo.png";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Left Section - Logo & Description */}
          <div className="footer-section footer-left">
            <div className="footer-logo">
              <img src={logo} alt="The Luxury Restaurant" />
            </div>
            <h3 className="footer-brand-name">The Luxury Restaurant</h3>
            <p className="footer-description">
              Nhận những ưu đãi mới nhất về ẩm thực và các chương trình khuyến mãi hấp dẫn từ nhà hàng của chúng tôi.
            </p>
          </div>

          {/* Middle Section - Contact Info */}
          <div className="footer-section footer-middle">
            <h4 className="footer-section-title">Liên Hệ</h4>
            <div className="footer-contact-info">
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>111 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <a href="mailto:contact@luxury.com">contact@luxury.com</a>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <a href="tel:(012)3456789">(012) 345 6789</a>
              </div>
              <div className="contact-item">
                <i className="fas fa-clock"></i>
                <span>Giờ mở cửa: 08:00 - 23:00</span>
              </div>
            </div>
          </div>

          {/* Right Section - Social Media */}
          <div className="footer-section footer-right">
            <h4 className="footer-section-title">Social Media</h4>
            <div className="footer-social">
              <a href="#" className="footer-social-link" title="Facebook">
                <i className="fab fa-facebook-f"></i>
                <span>Facebook</span>
              </a>
              <a href="#" className="footer-social-link" title="Instagram">
                <i className="fab fa-instagram"></i>
                <span>Instagram</span>
              </a>
              <a href="#" className="footer-social-link" title="Twitter">
                <i className="fab fa-twitter"></i>
                <span>Twitter</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2025 The Luxury Restaurant. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;