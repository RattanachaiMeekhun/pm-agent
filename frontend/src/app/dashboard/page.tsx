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
  PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal, Input, Form } from "antd";

const { Title } = Typography;
const { TextArea } = Input;

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

const data: DataType[] = [];

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

export default function DashboardPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleStartProject = async (values: any) => {
    const { projectName, clientName, requirements } = values;
    const params = new URLSearchParams({
      project: projectName,
      client: clientName,
      msg: requirements,
    });
    router.push(`/project/new?${params.toString()}`);
    setIsModalOpen(false);
  };

  return (
    <MainLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header Action Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            My Projects
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/project/new")}
          >
            New Project
          </Button>
        </div>

        {/* New Project Modal */}
        <Modal
          title="Start New Project"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <Form layout="vertical" form={form} onFinish={handleStartProject}>
            <Form.Item
              name="projectName"
              label="Project Name"
              rules={[{ required: true, message: "Please enter project name" }]}
            >
              <Input placeholder="e.g. Acme Website Redesign" />
            </Form.Item>
            <Form.Item
              name="clientName"
              label="Client Name"
              rules={[{ required: true, message: "Please enter client name" }]}
            >
              <Input placeholder="e.g. Acme Corp" />
            </Form.Item>
            <Form.Item
              name="requirements"
              label="Initial Requirements"
              rules={[
                {
                  required: true,
                  message: "Please describe the project briefly",
                },
              ]}
            >
              <TextArea rows={4} placeholder="I need a website for..." />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Start Consultation
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Stats Row */}
        <Row gutter={16}>
          <Col span={8}>
            <Card variant="borderless">
              <Statistic
                title="Total Projects"
                value={0}
                prefix={<FolderOpenOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card variant="borderless">
              <Statistic
                title="Drafting in Progress"
                value={0}
                prefix={<EditOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card variant="borderless">
              <Statistic
                title="Pending Review"
                value={0}
                prefix={<HourglassOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Table Section */}
        <div>
          <Table columns={columns} dataSource={data} />
        </div>
      </div>
    </MainLayout>
  );
}
