import React, { useState } from "react";
import "./sign.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { auth } from "../../firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  UserCredential,
  sendEmailVerification,
} from "firebase/auth";
import apiClient from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Sign: React.FC = () => {
  const [rightActive, setRightActive] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !signUpName ||
      !signUpEmail ||
      !signUpPhone ||
      !signUpPassword ||
      !signUpConfirmPassword
    ) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (signUpPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    let userCredential: UserCredential | null = null;
    try {
      userCredential = await createUserWithEmailAndPassword(
        auth,
        signUpEmail,
        signUpPassword
      );
      await sendEmailVerification(userCredential.user);
      console.log("Verification email sent to:", signUpEmail);
    } catch (error: any) {
      console.error("Error signing up (Firebase):", error);
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("Email đã được sử dụng");
          break;
        case "auth/invalid-email":
          setError("Email không hợp lệ");
          break;
        case "auth/weak-password":
          setError("Mật khẩu quá yếu");
          break;
        default:
          setError("Đăng ký Firebase thất bại. Vui lòng thử lại");
      }
      return;
    }

    if (userCredential) {
      try {
        await apiClient.post("/api/users", {
          uid: userCredential.user.uid,
          fullName: signUpName,
          email: signUpEmail,
          phoneNumber: signUpPhone,
        });
        setSuccess("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.");
        console.log(
          "User created in Firebase and Backend:",
          userCredential.user
        );

        setSignUpName("");
        setSignUpEmail("");
        setSignUpPhone("");
        setSignUpPassword("");
        setSignUpConfirmPassword("");
        await login();
        setTimeout(() => {
          window.location.href = "/signin";
        }, 1000);
      } catch (error: any) {
        console.error("Error creating user in backend:", error);
        try {
          if (userCredential && userCredential.user) {
            await userCredential.user.delete();
            console.log(
              "Orphaned Firebase user deleted due to backend failure."
            );
          }
        } catch (deleteError) {
          console.error(
            "Failed to delete orphaned Firebase user:",
            deleteError
          );
        }

        let errorMessage = "Đăng ký thất bại. Vui lòng thử lại.";

        if (error.response && error.response.data) {
          errorMessage = error.response.data;
        }

        setError(errorMessage);
      }
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!signInEmail || !signInPassword) {
      setError("Vui lòng điền email và mật khẩu");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        signInEmail,
        signInPassword
      );
      await login();
      console.log("User signed in:", userCredential.user);
      if (!userCredential.user.emailVerified) {
        setError("Vui lòng xác nhận email trước khi đăng nhập.");
        return;
      }
      setSuccess("Đăng nhập thành công!");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error: any) {
      console.error("Error signing in:", error);
      switch (error.code) {
        case "auth/user-not-found":
          setError("Không tìm thấy tài khoản");
          break;
        case "auth/wrong-password":
          setError("Mật khẩu không đúng");
          break;
        case "auth/invalid-email":
          setError("Email không hợp lệ");
          break;
        case "auth/invalid-credential":
          setError("Email hoặc mật khẩu không đúng");
          break;
        default:
          setError("Đăng nhập thất bại. Vui lòng thử lại");
      }
    }
  };

  return (
    <div className="body-sign">
      <div
        className={`container-sign ${rightActive ? "right-panel-active" : ""}`}
        id="container"
      >
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignUp}>
            <h1>Create Account</h1>
            {error && rightActive && <p className="error-message">{error}</p>}
            {success && rightActive && (
              <p className="success-message">{success}</p>
            )}
            <div className="input-group">
              <span className="input-icon">
                <i className="fas fa-user" aria-hidden />
              </span>
              <input
                type="text"
                placeholder="Name"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <span className="input-icon">
                <i className="fas fa-envelope" aria-hidden />
              </span>
              <input
                type="email"
                placeholder="Email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
              <span className="input-icon">
                <i className="fas fa-phone" aria-hidden />
              </span>
              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                aria-label="Phone number"
                pattern="[0-9]{9,12}"
                value={signUpPhone}
                onChange={(e) => setSignUpPhone(e.target.value)}
              />
            </div>
            <div className="input-group">
              <span className="input-icon">
                <i className="fas fa-lock" aria-hidden />
              </span>
              <input
                type="password"
                placeholder="Password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
              />
            </div>
            <div className="input-group">
              <span className="input-icon">
                <i className="fas fa-lock" aria-hidden />
              </span>
              <input
                type="password"
                placeholder="Confirm Password"
                value={signUpConfirmPassword}
                onChange={(e) => setSignUpConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit">Sign Up</button>
          </form>
        </div>

        <div className="form-container sign-in-container">
          <form onSubmit={handleSignIn}>
            <h1>Sign in</h1>
            {error && !rightActive && <p className="error-message">{error}</p>}
            {success && !rightActive && (
              <p className="success-message">{success}</p>
            )}
            <div className="input-group">
              <span className="input-icon">
                <i className="fas fa-envelope" aria-hidden />
              </span>
              <input
                type="email"
                placeholder="Email"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
              <span className="input-icon">
                <i className="fas fa-lock" aria-hidden />
              </span>
              <input
                type="password"
                placeholder="Password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
              />
            </div>
            <a href="/reset-password">Forgot your password?</a>
            <button type="submit">Sign In</button>
          </form>
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Chào mừng trở lại</h1>
              <p>Rất vui được gặp lại! Quản lý đặt chỗ của bạn tại đây</p>
              <button
                className="ghost"
                id="signIn"
                onClick={() => setRightActive(false)}
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Xin chào</h1>
              <p>
                {" "}
                Tạo tài khoản mới. Trải nghiệm đặt bàn nhanh chóng và dễ dàng
                hơn.
              </p>
              <button
                className="ghost"
                id="signUp"
                onClick={() => setRightActive(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sign;
