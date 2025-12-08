import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  theme: "dark" | "light" | "auto";
  language: string;
  setTheme: (theme: "dark" | "light" | "auto") => void;
  setLanguage: (language: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<"dark" | "light" | "auto">("dark");
  const [language, setLanguageState] = useState("vi");

  // Load saved settings on mount
  useEffect(() => {
    const savedGeneral = localStorage.getItem("generalSettings");
    if (savedGeneral) {
      const general = JSON.parse(savedGeneral);
      setThemeState(general.theme || "dark");
      setLanguageState(general.language || "vi");
      applyTheme(general.theme || "dark");
      applyLanguage(general.language || "vi");
    }
  }, []);

  const applyTheme = (newTheme: string) => {
    document.documentElement.setAttribute("data-theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.style.colorScheme = "dark";
      document.body.style.background = "#181818";
      document.body.style.color = "#EAE0D5";
    } else if (newTheme === "light") {
      document.documentElement.style.colorScheme = "light";
      document.body.style.background = "#FFFFFF";
      document.body.style.color = "#181818";
    }
  };

  const applyLanguage = (newLanguage: string) => {
    document.documentElement.lang = newLanguage;
    localStorage.setItem("language", newLanguage);
  };

  const setTheme = (newTheme: "dark" | "light" | "auto") => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage);
    applyLanguage(newLanguage);
  };

  return (
    <ThemeContext.Provider value={{ theme, language, setTheme, setLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
