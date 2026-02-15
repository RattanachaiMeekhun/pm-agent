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

  // Set body background color explicitly because Antd ConfigProvider applies it to components, not body
  useEffect(() => {
    if (isDarkMode) {
      document.body.style.backgroundColor = "#141414"; // Antd dark bg
      document.body.style.color = "#ffffff";
    } else {
      document.body.style.backgroundColor = "#f5f5f5"; // Antd default bg
      document.body.style.color = "rgba(0, 0, 0, 0.88)";
    }
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
