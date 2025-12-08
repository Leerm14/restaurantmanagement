import React, { useState, useEffect } from "react";
import "./Account.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useTheme } from "../../../contexts/ThemeContext";
import { t } from "../../../utils/translations";
import apiClient from "../../../services/api";
import { auth } from "../../../firebaseConfig";
import {
  RecaptchaVerifier,
  linkWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatar: string;
  joinDate: string;
  roleName?: string;
}

const Account: React.FC = () => {
  const { language } = useTheme();
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    fullName: "",
    email: "",
    phoneNumber: "",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    joinDate: "",
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationResult, setVerificationResult] =
    useState<ConfirmationResult | null>(null);
  const [isPhoneVerifiedFirebase, setIsPhoneVerifiedFirebase] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/api/users/me");
        const data = response.data;

        const formattedDate = new Date(data.createdAt).toLocaleDateString(
          "vi-VN",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        );

        const userProfile: UserProfile = {
          id: data.id,
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          joinDate: formattedDate,
          roleName: data.roleName,
        };

        setProfile(userProfile);
        setEditName(userProfile.fullName);

        if (auth.currentUser && auth.currentUser.phoneNumber) {
          setIsPhoneVerifiedFirebase(true);
        } else {
          setIsPhoneVerifiedFirebase(false);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSaveName = async () => {
    if (!profile.id) return;
    try {
      const updateData = {
        fullName: editName,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        roleName: profile.roleName,
      };

      await apiClient.put(`/api/users/${profile.id}`, updateData);
      setProfile((prev) => ({ ...prev, fullName: editName }));
      setIsEditingName(false);
      alert("Cập nhật tên thành công!");
    } catch (error: any) {
      console.error(error);
      alert("Cập nhật thất bại.");
    }
  };

  const handleOpenVerifyModal = () => {
    if (profile.phoneNumber) {
      setNewPhoneNumber(profile.phoneNumber);
    } else {
      setNewPhoneNumber("");
    }
    setIsVerifyingPhone(true);
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );
    }
  };

  const handleSendOtp = async () => {
    if (!newPhoneNumber) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }

    if (!auth.currentUser) {
      alert("Bạn chưa đăng nhập!");
      return;
    }

    let formattedPhone = newPhoneNumber.trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+84" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+84" + formattedPhone;
    }

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      if (appVerifier) {
        const confirmationResult = await linkWithPhoneNumber(
          auth.currentUser,
          formattedPhone,
          appVerifier
        );
        setVerificationResult(confirmationResult);
        alert(`Mã xác thực đã được gửi đến ${formattedPhone}`);
      }
    } catch (error: any) {
      console.error("Lỗi gửi OTP:", error);
      if (error.code === "auth/credential-already-in-use") {
        alert("Số điện thoại này đã được liên kết với tài khoản khác.");
      } else {
        alert("Gửi mã thất bại: " + error.message);
      }
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (!verificationResult || !otp) return;

    try {
      await verificationResult.confirm(otp);

      setIsPhoneVerifiedFirebase(true);
      await handleUpdatePhoneToBackend();
    } catch (error: any) {
      console.error("Lỗi xác thực:", error);
      if (error.code === "auth/credential-already-in-use") {
        alert("Số điện thoại này đã được sử dụng.");
      } else {
        alert("Mã xác thực không đúng!");
      }
    }
  };

  const handleUpdatePhoneToBackend = async () => {
    try {
      let phoneToSave = newPhoneNumber;
      if (phoneToSave.startsWith("+84")) {
        phoneToSave = "0" + phoneToSave.substring(3);
      }

      const updateData = {
        fullName: profile.fullName,
        email: profile.email,
        phoneNumber: phoneToSave,
        roleName: profile.roleName,
      };

      await apiClient.put(`/api/users/${profile.id}`, updateData);

      setProfile((prev) => ({ ...prev, phoneNumber: phoneToSave }));
      setIsVerifyingPhone(false);
      setVerificationResult(null);
      setOtp("");
      setNewPhoneNumber("");
      alert("Xác thực số điện thoại thành công!");
    } catch (error) {
      console.error("Lỗi backend:", error);
      alert("Đã liên kết tài khoản thành công!");
    }
  };

  if (loading) {
    return (
      <div className="account-page">
        <div className="account-container account-loading-container">
          <p className="account-loading-text">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <div className="account-header">
          <h1 className="account-title">{t("accountTitle", language)}</h1>
          <p className="account-subtitle">{t("accountSubtitle", language)}</p>
        </div>

        <div className="account-content">
          <div className="account-main">
            <div className="account-section">
              <div className="profile-info">
                <div className="profile-details">
                  <div className="profile-card">
                    <div className="card-item">
                      <span className="card-label">
                        {t("fullName", language)}:
                      </span>
                      {isEditingName ? (
                        <div className="edit-name-wrapper">
                          <input
                            type="text"
                            className="input-edit-inline"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                          <button
                            className="btn-icon-save"
                            onClick={handleSaveName}
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            className="btn-icon-cancel"
                            onClick={() => {
                              setIsEditingName(false);
                              setEditName(profile.fullName);
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="value-wrapper">
                          <span className="card-value">{profile.fullName}</span>
                          <button
                            className="btn-icon-edit"
                            onClick={() => setIsEditingName(true)}
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="card-item">
                      <span className="card-label">
                        {t("email", language)}:
                      </span>
                      <div className="value-wrapper">
                        <span className="card-value">{profile.email}</span>
                        <span className="badge-verified">
                          <i className="fas fa-check-circle"></i> Đã xác thực
                        </span>
                      </div>
                    </div>

                    <div className="card-item">
                      <span className="card-label">
                        {t("phone", language)}:
                      </span>
                      <div className="value-wrapper">
                        <span className="card-value">
                          {profile.phoneNumber || "Chưa có"}
                        </span>

                        {isPhoneVerifiedFirebase ? (
                          // ĐÃ XÁC THỰC: Chỉ hiện badge, KHÔNG có nút đổi
                          <span className="badge-verified">
                            <i className="fas fa-shield-alt"></i> Đã xác thực
                          </span>
                        ) : (
                          // CHƯA XÁC THỰC: Hiện badge và nút Xác thực ngay
                          <>
                            <span className="badge-unverified">
                              <i className="fas fa-unlink"></i> Chưa liên kết
                            </span>
                            <button
                              className="btn-verify-now"
                              onClick={handleOpenVerifyModal}
                            >
                              Xác thực ngay
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="card-item">
                      <span className="card-label">
                        {t("joinDate", language)}:
                      </span>
                      <span className="card-value">{profile.joinDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {isVerifyingPhone && (
                <div className="phone-verify-container">
                  <div className="phone-verify-header">
                    <h3>
                      <i className="fas fa-mobile-alt"></i> Xác thực Số điện
                      thoại
                    </h3>
                    <button
                      className="btn-close-verify"
                      onClick={() => setIsVerifyingPhone(false)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  <div className="phone-verify-body">
                    <p className="verify-note">
                      Vui lòng xác thực số điện thoại để bảo vệ tài khoản của
                      bạn.
                    </p>

                    {!verificationResult ? (
                      <div className="verify-step">
                        <label>Số điện thoại:</label>
                        <div className="phone-input-group">
                          <input
                            type="tel"
                            placeholder="+84..."
                            value={newPhoneNumber}
                            onChange={(e) => setNewPhoneNumber(e.target.value)}
                          />
                          <button
                            className="btn-send-otp"
                            onClick={handleSendOtp}
                          >
                            Gửi mã
                          </button>
                        </div>
                        <div id="recaptcha-container"></div>
                      </div>
                    ) : (
                      <div className="verify-step">
                        <label>Nhập mã xác thực (6 số):</label>
                        <div className="phone-input-group">
                          <input
                            type="text"
                            placeholder="123456"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                          />
                          <button
                            className="btn-verify-otp"
                            onClick={handleVerifyOtp}
                          >
                            Xác nhận
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}

export default Account;
