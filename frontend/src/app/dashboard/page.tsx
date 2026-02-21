"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Table,
  Tag,
  Avatar,
  Button,
  Space,
  Modal,
  Input,
  Form,
} from "antd";
import {
  FolderOpenOutlined,
  EditOutlined,
  HourglassOutlined,
  MoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { fetchProjectList } from "./slice/dashboard.thunks";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { selectProjectList } from "./slice/dashboard.selectors";
import { Project } from "../project/slice/project.types";
import styles from "./dashboard.module.css";

const { TextArea } = Input;

export default function DashboardPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const projectList = useSelector(selectProjectList);

  useEffect(() => {
    const fetchList = async () => {
      await dispatch(fetchProjectList());
    };
    fetchList();
  }, [dispatch]);

  const columns: ColumnsType<Project> = [
    {
      title: "Project Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Space size="middle">
          <Avatar
            shape="square"
            className={styles.projectAvatar}
            icon={<FolderOpenOutlined />}
            size="large"
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className={styles.projectName}>{record.name}</span>
            <span className={styles.projectSubtitle}>
              {record.name}
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
          <Avatar size="small" style={{ backgroundColor: '#a855f7' }}>
            {record.client ? record.client.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{record.client}</span>
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
          <Tag color={color} key={status} style={{ borderRadius: '12px', padding: '2px 10px', fontWeight: 600 }}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Last Modified",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (date) => (
        <span style={{ color: 'var(--text-secondary)' }}>
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record: Project) => (
        <Button 
          type="text" 
          icon={<MoreOutlined />} 
          onClick={() => router.push(`/project/view/${record.id}`)}
          style={{ color: 'var(--text-secondary)' }}
        />
      ),
    },
  ];

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
      <div className={styles.dashboardContainer}>
        {/* Header Action Row */}
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>My Projects</h1>
          <button
            className={styles.primaryButton}
            onClick={() => setIsModalOpen(true)}
          >
            <PlusOutlined />
            New Project
          </button>
        </div>

        {/* New Project Modal */}
        <Modal
          title="Start New Project"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          centered
        >
          <Form layout="vertical" form={form} onFinish={handleStartProject} style={{ marginTop: '24px' }}>
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
            <Form.Item style={{ marginBottom: 0 }}>
              <button className={styles.primaryButton} style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: '15px' }} type="submit">
                Start Consultation
              </button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Stats Row */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statIconWrapper}>
                <FolderOpenOutlined />
              </div>
              <h3 className={styles.statTitle}>Total Projects</h3>
            </div>
            <p className={styles.statValue}>{projectList.length || 0}</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statIconWrapper} style={{ color: '#a855f7' }}>
                <EditOutlined />
              </div>
              <h3 className={styles.statTitle}>Drafting</h3>
            </div>
            <p className={styles.statValue}>
              {projectList.filter((p: Project) => p.status === 'Drafting').length || 0}
            </p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statIconWrapper} style={{ color: '#f59e0b' }}>
                <HourglassOutlined />
              </div>
              <h3 className={styles.statTitle}>Pending Review</h3>
            </div>
            <p className={styles.statValue}>
              {projectList.filter((p: Project) => p.status === 'Waiting').length || 0}
            </p>
          </div>
        </div>

        {/* Table Section */}
        <div className={styles.tableContainer}>
          <Table 
            columns={columns} 
            dataSource={projectList} 
            rowKey={"id"} // Use id instead of thread_id as per Project type
            pagination={{ placement: ["bottomCenter"] }}
          />
        </div>
      </div>
    </MainLayout>
  );
}
