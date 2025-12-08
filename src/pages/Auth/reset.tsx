import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./sign.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(
        "Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn."
      );
      setEmail("");

      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      switch (error.code) {
        case "auth/user-not-found":
          setError("Không tìm thấy tài khoản với email này");
          break;
        case "auth/invalid-email":
          setError("Email không hợp lệ");
          break;
        case "auth/too-many-requests":
          setError("Quá nhiều yêu cầu. Vui lòng thử lại sau");
          break;
        default:
          setError("Gửi email thất bại. Vui lòng thử lại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="body-sign">
      <div className="container-sign">
        <div
          className="form-container"
          style={{ position: "relative", width: "100%", opacity: 1 }}
        >
          <form
            onSubmit={handleResetPassword}
            style={{ maxWidth: "400px", padding: "40px" }}
          >
            <h1>Đặt lại mật khẩu</h1>
            <p
              style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}
            >
              Nhập email của bạn để nhận liên kết đặt lại mật khẩu
            </p>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <div className="input-group">
              <span className="input-icon">
                <i className="fas fa-envelope" aria-hidden />
              </span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Đang gửi..." : "Gửi email đặt lại"}
            </button>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/signin");
              }}
              style={{ marginTop: "20px", display: "block" }}
            >
              Quay lại đăng nhập
            </a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
