"use client";

import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Tag,
  Avatar,
  Button,
  Space,
  Typography,
} from "antd";
import {
  FolderOpenOutlined,
  EditOutlined,
  HourglassOutlined,
  MoreOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

// Mock Data
interface DataType {
  key: string;
  name: string;
  subName: string;
  client: string;
  clientLogo: string;
  status: string;
  lastModified: string;
  type: string; // for icon color
}

const data: DataType[] = [
  {
    key: "1",
    name: "Website Redesign",
    subName: "Revamp for Q4 launch",
    client: "Acme Corp",
    clientLogo: "https://api.dicebear.com/7.x/identicon/svg?seed=Acme",
    status: "Drafting",
    lastModified: "2 hours ago",
    type: "web",
  },
  {
    key: "2",
    name: "Mobile App MVP",
    subName: "Initial scope definition",
    client: "TechStart Inc",
    clientLogo: "https://api.dicebear.com/7.x/identicon/svg?seed=Tech",
    status: "Waiting",
    lastModified: "1 day ago",
    type: "app",
  },
  {
    key: "3",
    name: "E-commerce Platform",
    subName: "Shopify Plus migration",
    client: "RetailCo",
    clientLogo: "https://api.dicebear.com/7.x/identicon/svg?seed=Retail",
    status: "Completed",
    lastModified: "3 days ago",
    type: "commerce",
  },
  {
    key: "4",
    name: "Internal Tool",
    subName: "Inventory management",
    client: "Global Logistics",
    clientLogo: "https://api.dicebear.com/7.x/identicon/svg?seed=Global",
    status: "Drafting",
    lastModified: "5 days ago",
    type: "tool",
  },
];

const columns: ColumnsType<DataType> = [
  {
    title: "Project Name",
    dataIndex: "name",
    key: "name",
    render: (_, record) => (
      <Space>
        <Avatar
          shape="square"
          style={{ backgroundColor: "#e6f7ff", color: "#1890ff" }}
          icon={<FolderOpenOutlined />}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 500 }}>{record.name}</span>
          <span style={{ fontSize: 12, color: "#8c8c8c" }}>
            {record.subName}
          </span>
        </div>
      </Space>
    ),
  },
  {
    title: "Client",
    dataIndex: "client",
    key: "client",
    render: (_, record) => (
      <Space>
        <Avatar src={record.clientLogo} size="small" />
        <span>{record.client}</span>
      </Space>
    ),
  },
  {
    title: "Status",
    key: "status",
    dataIndex: "status",
    render: (status) => {
      let color = "default";
      if (status === "Completed") color = "success";
      if (status === "Drafting") color = "processing";
      if (status === "Waiting") color = "warning";
      return (
        <Tag color={color} key={status}>
          {status.toUpperCase()}
        </Tag>
      );
    },
  },
  {
    title: "Last Modified",
    dataIndex: "lastModified",
    key: "lastModified",
  },
  {
    title: "Actions",
    key: "action",
    render: () => <Button type="text" icon={<MoreOutlined />} />,
  },
];

export default function Home() {
  return (
    <MainLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Stats Row */}
        <Row gutter={16}>
          <Col span={8}>
            <Card variant="borderless">
              <Statistic
                title="Total Projects"
                value={24}
                prefix={<FolderOpenOutlined />}
                suffix={
                  <span
                    style={{
                      fontSize: 12,
                      color: "#3f8600",
                      marginLeft: 8,
                      backgroundColor: "#f6ffed",
                      padding: "2px 8px",
                      borderRadius: 10,
                    }}
                  >
                    <ArrowUpOutlined /> 12%
                  </span>
                }
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card variant="borderless">
              <Statistic
                title="Drafting in Progress"
                value={5}
                prefix={<EditOutlined />}
                suffix={
                  <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                    Active now
                  </span>
                }
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card variant="borderless">
              <Statistic
                title="Pending Review"
                value={3}
                prefix={<HourglassOutlined />}
                suffix={
                  <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                    Waiting for client
                  </span>
                }
              />
            </Card>
          </Col>
        </Row>

        {/* Table Section */}
        <div>
          <Title level={4}>Recent Projects</Title>
          <Table columns={columns} dataSource={data} />
        </div>
      </div>
    </MainLayout>
  );
}
