import React, { useState } from "react";
import "./Settings.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useTheme } from "../../../contexts/ThemeContext";
import { t } from "../../../utils/translations";

const Settings: React.FC = () => {
  const { theme, setTheme, language, setLanguage } = useTheme();
  const [activeTab, setActiveTab] = useState<"general">("general");
  const [generalSettings, setGeneralSettings] = useState({
    language: language,
    theme: theme,
    timeZone: "GMT+7"
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleGeneralChange = (key: string, value: any) => {
    const newSettings = {
      ...generalSettings,
      [key]: value
    };
    setGeneralSettings(newSettings);
    
    if (key === "theme") {
      setTheme(value);
    }
    
    if (key === "language") {
      setLanguage(value);
    }
    
    // Lưu tự động
    localStorage.setItem("generalSettings", JSON.stringify(newSettings));
    showSuccess();
  };

  const showSuccess = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        {showSuccessMessage && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i>
            <span>{t("settingsSaved", language)}</span>
          </div>
        )}

        <div className="settings-header-section">
          <h1 className="settings-title">{t("settingsTitle", language)}</h1>
          <p className="settings-subtitle">{t("settingsSubtitle", language)}</p>
        </div>

        <div className="settings-content">
          <div className="settings-sidebar">
            <div className="sidebar-nav">
              <button
                className={`sidebar-nav-item ${activeTab === "general" ? "active" : ""}`}
                onClick={() => setActiveTab("general")}
              >
                <i className="fas fa-sliders-h"></i>
                <span>{t("generalInfo", language)}</span>
              </button>
            </div>
          </div>

          <div className="settings-main">
            {activeTab === "general" && (
              <div className="settings-section">
                <div className="section-header">
                  <h2>{t("generalSettings", language)}</h2>
                </div>

                <div className="settings-form">
                  <div className="settings-item">
                    <div className="setting-label">
                      <span className="setting-title">{t("language", language)}</span>
                      <p className="setting-description">{t("selectLanguage", language)}</p>
                    </div>
                    <select 
                      value={generalSettings.language}
                      onChange={(e) => handleGeneralChange("language", e.target.value)}
                      className="select-input"
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                      <option value="zh">中文</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>

                  <div className="divider"></div>

                  <div className="settings-item">
                    <div className="setting-label">
                      <span className="setting-title">{t("theme", language)}</span>
                      <p className="setting-description">{t("selectTheme", language)}</p>
                    </div>
                    <select 
                      value={generalSettings.theme}
                      onChange={(e) => handleGeneralChange("theme", e.target.value)}
                      className="select-input"
                    >
                      <option value="dark">{t("dark", language)}</option>
                      <option value="light">{t("light", language)}</option>
                      <option value="auto">{t("auto", language)}</option>
                    </select>
                  </div>

                  <div className="divider"></div>

                  <div className="settings-item">
                    <div className="setting-label">
                      <span className="setting-title">{t("timeZone", language)}</span>
                      <p className="setting-description">{t("selectTimeZone", language)}</p>
                    </div>
                    <select 
                      value={generalSettings.timeZone}
                      onChange={(e) => handleGeneralChange("timeZone", e.target.value)}
                      className="select-input"
                    >
                      <option value="GMT+7">{t("gmt7", language)}</option>
                      <option value="GMT+8">{t("gmt8", language)}</option>
                      <option value="GMT+0">{t("gmt0", language)}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
