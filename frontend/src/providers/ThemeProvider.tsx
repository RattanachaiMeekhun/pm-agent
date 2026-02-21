"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { App, ConfigProvider, theme } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check system preference on mount
  useEffect(() => {
    const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(matchMedia.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    matchMedia.addEventListener("change", handler);
    return () => matchMedia.removeEventListener("change", handler);
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Apply data-theme attribute to html element so CSS variables in globals.css take effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
    document.body.style.removeProperty("background-color");
    document.body.style.removeProperty("color");
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <AntdRegistry>
        <ConfigProvider
          theme={{
            algorithm: isDarkMode
              ? theme.darkAlgorithm
              : theme.defaultAlgorithm,
            token: {
              colorPrimary: "#196ee6", // PM Agent Primary Blue
              borderRadius: 6,
            },
          }}
        >
          <App>{children}</App>
        </ConfigProvider>
      </AntdRegistry>
    </ThemeContext.Provider>
  );
}
