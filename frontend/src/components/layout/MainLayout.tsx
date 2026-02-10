"use client";

import React, { useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Typography,
  Space,
  theme,
  Dropdown,
} from "antd";
import {
  AppstoreOutlined,
  FolderOpenOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  MenuOutlined,
  PlusOutlined,
  FilterOutlined,
  UserOutlined,
  BulbOutlined,
  BulbFilled,
  HistoryOutlined,
} from "@ant-design/icons";
import { useTheme } from "@/providers/ThemeProvider";
import { useRouter } from "next/navigation";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const {
    token: { colorBgContainer, borderRadiusLG, colorBgLayout },
  } = theme.useToken();
  const router = useRouter(); // Import this

  const menuItems = [
    {
      key: "dashboard",
      icon: <AppstoreOutlined />,
      label: "My Projects",
      onClick: () => router.push("/dashboard"),
    },

    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme={isDarkMode ? "dark" : "light"}
        style={{
          borderRight: isDarkMode ? "none" : "1px solid #e5e5e5",
          background: isDarkMode ? "#1e1e1e" : "#f0f4f9",
        }}
        width={260}
      >
        <div
          style={{
            padding: "20px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: "16px" }}
            />
            {!collapsed && (
              <Typography.Text
                strong
                style={{ fontSize: 18, color: isDarkMode ? "#fff" : "#444746" }}
              >
                Gemini PM
              </Typography.Text>
            )}
          </div>
        </div>

        {!collapsed && (
          <div style={{ padding: "0 16px 16px 16px" }}>
            <Button
              block
              style={{
                borderRadius: 20,
                height: 48,
                background: isDarkMode ? "#2d2d2d" : "#dde3ea",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                paddingLeft: 20,
                color: isDarkMode ? "#e3e3e3" : "#1f1f1f",
                fontSize: 14,
                fontWeight: 500,
              }}
              icon={
                <PlusOutlined
                  style={{ color: isDarkMode ? "#a8c7fa" : "#444746" }}
                />
              }
              onClick={() => router.push("/project/new")}
            >
              New Project
            </Button>
          </div>
        )}

        <Menu
          theme={isDarkMode ? "dark" : "light"}
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={menuItems}
          style={{
            borderRight: 0,
            background: "transparent",
            fontSize: 14,
          }}
        />

        {/* User Profile at Bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            padding: "16px",
          }}
        >
          {/* ...existing user code... */}
        </div>
      </Sider>

      <Layout style={{ background: isDarkMode ? "#131314" : "#ffffff" }}>
        <Header
          style={{
            padding: "0 24px",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end", // Push to right
            height: 64,
          }}
        >
          <Space>
            <Button
              type="text"
              icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
              onClick={toggleTheme}
            />
            <Avatar
              icon={<UserOutlined />}
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              style={{ cursor: "pointer" }}
            />
          </Space>
        </Header>

        <Content
          style={{
            margin: 16,
            padding: 0,
            overflow: "hidden", // Let children handle scroll
            background: "transparent",
            borderRadius: isDarkMode ? 24 : 0,
            // Gemini often has rounded corners on the main container in web app
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
