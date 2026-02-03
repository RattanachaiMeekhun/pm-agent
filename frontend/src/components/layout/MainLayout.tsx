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
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  PlusOutlined,
  FilterOutlined,
  UserOutlined,
  BulbOutlined,
  BulbFilled,
} from "@ant-design/icons";
import { useTheme } from "@/providers/ThemeProvider";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: "dashboard",
      icon: <AppstoreOutlined />,
      label: "Dashboard",
    },
    {
      key: "projects",
      icon: <FolderOpenOutlined />,
      label: "Projects",
    },
    {
      key: "clients",
      icon: <TeamOutlined />,
      label: "Clients",
    },
    {
      key: "templates",
      icon: <FileTextOutlined />,
      label: "Templates",
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
          borderRight: isDarkMode ? "none" : "1px solid #f0f0f0",
        }}
        width={250}
      >
        <div
          style={{
            padding: "24px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Avatar
            style={{ backgroundColor: "#196ee6", verticalAlign: "middle" }}
            size="large"
            shape="square"
          >
            PM
          </Avatar>
          {!collapsed && (
            <div style={{ lineHeight: "1.2" }}>
              <Title
                level={5}
                style={{ margin: 0, color: isDarkMode ? "#fff" : "inherit" }}
              >
                PM Agent
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Pro Workspace
              </Text>
            </div>
          )}
        </div>

        <Menu
          theme={isDarkMode ? "dark" : "light"}
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />

        {/* Bottom User Section could go here, absolute positioned or flex */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            padding: "16px",
            borderTop: isDarkMode ? "1px solid #303030" : "1px solid #f0f0f0",
          }}
        >
          <Space
            align="center"
            style={{
              width: "100%",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            <Avatar
              icon={<UserOutlined />}
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            />
            {!collapsed && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Text strong>Alex Morgan</Text>
                <Text type="secondary" style={{ fontSize: 10 }}>
                  alex@agency.com
                </Text>
              </div>
            )}
          </Space>
        </div>
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: isDarkMode ? "none" : "1px solid #f0f0f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
                marginRight: 16,
              }}
            />
            <div className="header-title">
              <Title level={4} style={{ margin: 0 }}>
                Dashboard
              </Title>
              <Text type="secondary">
                Overview of your active SOWs and client briefs.
              </Text>
            </div>
          </div>

          <Space>
            <Button
              type="text"
              icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
              onClick={toggleTheme}
            />
            <Button icon={<FilterOutlined />}>Filter</Button>
            <Button type="primary" icon={<PlusOutlined />}>
              New Project
            </Button>
          </Space>
        </Header>

        <Content
          style={{
            margin: "24px 24px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflowY: "scroll",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
