"use client";

import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, Avatar, Space } from "antd";
import {
  AppstoreOutlined,
  SettingOutlined,
  MenuOutlined,
  PlusOutlined,
  UserOutlined,
  BulbOutlined,
  BulbFilled,
} from "@ant-design/icons";
import { useTheme } from "@/providers/ThemeProvider";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./layout.module.css";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

const { Sider } = Layout;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!token) {
      router.push("/auth");
    }
  }, [token]);

  const menuItems = [
    {
      key: "/dashboard",
      icon: <AppstoreOutlined />,
      label: "My Projects",
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ];

  return (
    <div className={styles.layout}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme={isDarkMode ? "dark" : "light"}
        className={styles.sider}
        width={260}
      >
        <div className={styles.siderHeader}>
          <div className={styles.logoContainer}>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: "var(--text-primary)" }}
            />
            {!collapsed && (
              <Link href="/" className={styles.logoContainer}>
                <div className={styles.logoIcon}>PM</div>
                <span className={styles.logoText}>PM Agent</span>
              </Link>
            )}
          </div>
        </div>

        {!collapsed && (
          <div className={styles.newProjectContainer}>
            <button
              className={styles.newProjectButton}
              onClick={() => router.push("/project/new")}
            >
              <PlusOutlined style={{ color: "#6366f1" }} />
              New Project
            </button>
          </div>
        )}

        <Menu
          theme={isDarkMode ? "dark" : "light"}
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          className={styles.menu}
          onClick={({ key }) => router.push(key)}
        />

        {/* User Profile at Bottom (Placeholder) */}
        <div className={styles.userProfile}>{/* User info can go here */}</div>
      </Sider>

      <div className={styles.mainWrapper}>
        <header className={styles.header}>
          <Space size="middle">
            <Button
              type="text"
              icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
              onClick={toggleTheme}
              style={{ color: "var(--text-secondary)" }}
            />
            <Avatar
              icon={<UserOutlined />}
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              style={{
                cursor: "pointer",
                border: "2px solid var(--border-color)",
              }}
            />
          </Space>
        </header>

        <main className={styles.contentContainer}>{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
