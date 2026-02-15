"use client";

import { Layout, Typography, Button, Space, Card, Row, Col, theme } from "antd";
import {
  RocketOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useTheme } from "@/providers/ThemeProvider";

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function LandingPage() {
  const {
    token: { colorBgContainer, colorPrimary },
  } = theme.useToken();
  const { isDarkMode } = useTheme();

 

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: colorBgContainer,
          padding: "0 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: colorPrimary,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            PM
          </div>
          <Text strong style={{ fontSize: 18 }}>
            PM Agent
          </Text>
        </div>
        <Space size="large">
          <Button type="text">Features</Button>
          <Button type="text">Solutions</Button>
          <Button type="text">Pricing</Button>
          <Link href="/dashboard">
            <Button type="primary">Launch Dashboard</Button>
          </Link>
        </Space>
      </Header>

      <Content>
        {/* Hero Section */}
        <div
          style={{
            padding: "100px 24px",
            textAlign: "center",
            background: isDarkMode
              ? "linear-gradient(135deg, #1f1f1f 0%, #141414 100%)"
              : "linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)",
          }}
        >
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <Title
              level={1}
              style={{
                fontSize: 56,
                marginBottom: 24,
                background: `linear-gradient(to right, ${colorPrimary}, #a0d911)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Supercharge Your Project Management with AI
            </Title>
            <Paragraph
              style={{ fontSize: 20, color: "gray", marginBottom: 40 }}
            >
              Automate workflows, predict risks, and deliver projects faster
              than ever before. The intelligent assistant for modern project
              managers.
            </Paragraph>
            <Space size="middle">
              <Link href="/dashboard">
                <Button
                  type="primary"
                  size="large"
                  shape="round"
                  icon={<RocketOutlined />}
                >
                  Get Started for Free
                </Button>
              </Link>
              <Button size="large" shape="round">
                View Documentation
              </Button>
            </Space>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ padding: "80px 24px", background: colorBgContainer }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <Title level={2}>Why Choose PM Agent?</Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Everything you need to manage complex projects with ease.
              </Text>
            </div>
            <Row gutter={[32, 32]}>
              <Col xs={24} md={8}>
                <Card
                  variant="borderless"
                  hoverable
                  style={{ height: "100%", textAlign: "center" }}
                >
                  <ThunderboltOutlined
                    style={{
                      fontSize: 48,
                      color: colorPrimary,
                      marginBottom: 24,
                    }}
                  />
                  <Title level={4}>Real-time Insights</Title>
                  <Paragraph type="secondary">
                    Get instant updates and predictive analytics on your project
                    health, budget, and timeline.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card
                  variant="borderless"
                  hoverable
                  style={{ height: "100%", textAlign: "center" }}
                >
                  <SafetyCertificateOutlined
                    style={{
                      fontSize: 48,
                      color: colorPrimary,
                      marginBottom: 24,
                    }}
                  />
                  <Title level={4}>Automated Compliance</Title>
                  <Paragraph type="secondary">
                    Ensure all your deliverables meet industry standards
                    automatically with our AI compliance checker.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card
                  variant="borderless"
                  hoverable
                  style={{ height: "100%", textAlign: "center" }}
                >
                  <TeamOutlined
                    style={{
                      fontSize: 48,
                      color: colorPrimary,
                      marginBottom: 24,
                    }}
                  />
                  <Title level={4}>Smart Resource Allocation</Title>
                  <Paragraph type="secondary">
                    Optimize team workload and prevent burnout with intelligent
                    resource distribution suggestions.
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </div>
        </div>

        {/* CTA Section */}
        <div
          style={{
            padding: "80px 24px",
            textAlign: "center",
            background: isDarkMode ? "#141414" : "#f0f2f5",
          }}
        >
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <Title level={2}>Ready to Transform Your Workflow?</Title>
            <Paragraph style={{ fontSize: 16, marginBottom: 32 }}>
              Join thousands of project managers who are delivering better
              results with PM Agent.
            </Paragraph>
            <Link href="/dashboard">
              <Button type="primary" size="large" shape="round">
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </Content>

      <Footer style={{ textAlign: "center", background: colorBgContainer }}>
        PM Agent ©{new Date().getFullYear()} Created with Ant Design & AI
      </Footer>
    </Layout>
  );
}
