"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Input,
  Button,
  List,
  Avatar,
  Typography,
  Card,
  Spin,
  Splitter,
  message as antMessage,
  Empty,
  theme,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Select,
  Drawer,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  RobotOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  LoadingOutlined,
  SaveOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { useTheme } from "@/providers/ThemeProvider";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/Axios";

const { TextArea } = Input;
const { Title, Text } = Typography;

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatThread {
  thread_id: string;
  title: string;
  updated_at: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sowContent, setSowContent] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyThreads, setHistoryThreads] = useState<ChatThread[]>([]);
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalOpen(true);
    // You might want to pre-fill description with sowContent
    if (sowContent) {
      form.setFieldsValue({ description: sowContent });
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (values: any) => {
    setCreateLoading(true);
    try {
      const payload = {
        name: values.name,
        client: values.client,
        budget: values.budget,
        description: values.description,
        status: "not_started",
        start_date: values.dateRange ? values.dateRange[0].toISOString() : null,
        end_date: values.dateRange ? values.dateRange[1].toISOString() : null,
        thread_id: threadId,
      };

      await api.post("/api/v1/project/create", payload);
      antMessage.success("Project created successfully!");
      setIsModalOpen(false);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error creating project:", error);
      antMessage.error(
        error.response?.data?.detail || "Failed to create project.",
      );
    } finally {
      setCreateLoading(false);
    }
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const { isDarkMode } = useTheme();
  const { token } = theme.useToken();

  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async ({ msg, tId }: { msg: string; tId: string }) => {
      const { data } = await api.post("/api/v1/project/consult", {
        message: msg,
        thread_id: tId,
      });
      return data;
    },
    onSuccess: (data, variables) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
      if (
        data.stage === "writer" ||
        (data?.response && data.response.toLowerCase().includes("sow"))
      ) {
        fetchSow(variables.tId);
      }
    },
    onError: () => {
      antMessage.error("Failed to get response.");
    },
  });

  const fetchChatHistory = async (tId: string) => {
    try {
      const { data } = await api.get(`/api/v1/project/history/${tId}`);
      if (
        data &&
        data.messages &&
        Array.isArray(data.messages) &&
        data.messages.length > 0
      ) {
        setMessages(data.messages);
        return true;
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
    return false;
  };

  const fetchThreads = async () => {
    try {
      const { data } = await api.get("/api/v1/project/threads");
      setHistoryThreads(data);
    } catch (error) {
      console.error("Failed to load history", error);
    }
  };

  const openHistory = () => {
    setHistoryOpen(true);
    fetchThreads();
  };

  const loadThread = (tId: string) => {
    setHistoryOpen(false);
    setMessages([]);
    setSowContent(null);
    router.push(`/project/new?threadId=${tId}`);
  };

  useEffect(() => {
    const initSession = async () => {
      if (initialized.current) return;

      const urlThreadId = searchParams.get("threadId");

      if (urlThreadId) {
        // Case 1: Resume specific thread
        initialized.current = true;
        setThreadId(urlThreadId);
        const hasHistory = await fetchChatHistory(urlThreadId);
        fetchSow(urlThreadId);

        if (!hasHistory) {
          // Fallback if history missing
          setMessages([
            {
              role: "assistant",
              content:
                "Messages not found for this thread. Starting fresh context...",
            },
          ]);
        }
      } else {
        // Case 2: Start new session
        const newThreadId = crypto.randomUUID();
        setThreadId(newThreadId);

        // Only send strict welcome if we haven't already
        // Check if we are "re-entering" due to strict mode or something?
        // initialized.current handles that.
        initialized.current = true;

        const initialMsg = searchParams.get("msg");
        const project = searchParams.get("project");

        if (initialMsg) {
          setMessages([
            {
              role: "assistant",
              content: `Starting project "**${project || "New Project"}**"...\n\nAnalyzing your requirements...`,
            },
          ]);
          sendInitialMessage(initialMsg, newThreadId);
        } else {
          setMessages([
            {
              role: "assistant",
              content:
                "**Hello! I am your PM Copilot.**\n\nPlease tell me about the project you want to build. I'll help you define the requirements and generate a professional Scope of Work (SOW).",
            },
          ]);
        }
      }
    };

    // We need to allow re-running if searchParams change (e.g. user clicks history item)
    // So we reset initialized.current if threadId matches urlThreadId?
    // Actually, if we use [searchParams], it runs on change.
    // We need to handle the "initialized" logic carefully.

    // Reset initialized if threadId in state != threadId in URL?
    const urlThreadId = searchParams.get("threadId");
    if (urlThreadId && urlThreadId !== threadId && threadId !== "") {
      initialized.current = false;
    }
    // Also if no url threadId and we have one, it means we navigated to "new"?
    if (!urlThreadId && threadId !== "" && messages.length > 2) {
      // Logic is tricky here.
    }

    // Simplest: Just run initSession()
    initSession();
  }, [searchParams]);

  const sendInitialMessage = (msg: string, tId: string) => {
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    sendMessage({ msg, tId });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    sendMessage({ msg: userMessage, tId: threadId });
  };

  const fetchSow = async (tId: string) => {
    try {
      const response = await api.get(`/api/v1/sow/${tId}`);
      const data = response.data;
      if (data.status === "completed" && data.sow_content) {
        setSowContent(data.sow_content);
        antMessage.success("Scope of Work generated!");
      }
    } catch (error) {
      console.error("Error fetching SOW:", error);
    }
  };

  return (
    <MainLayout>
      {/* Container fully fills the layout content area */}
      <div
        style={{
          height: "100%", // Subtract header ? No header is transparent.
          // Wait, MainLayout has 100vh. Content is flex 1.
          display: "flex",
          flexDirection: "column",
          background: isDarkMode ? "#131314" : "#fff",
          borderRadius: 24,
          overflow: "hidden", // For rounded corners to clip content
        }}
      >
        <Splitter style={{ flex: 1 }}>
          {/* --- Left Panel: Chat (Gemini Style) --- */}
          <Splitter.Panel defaultSize="45%" min="30%" max="70%">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                position: "relative",
                background: isDarkMode ? "#131314" : "#fff",
              }}
            >
              {/* Header for Back Button */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingRight: 24,
                }}
              >
                <Button
                  icon={<ArrowLeftOutlined />}
                  type="text"
                  onClick={() => router.push("/dashboard")}
                >
                  Back
                </Button>
                <Button
                  icon={<HistoryOutlined />}
                  type="text"
                  onClick={openHistory}
                >
                  History
                </Button>
              </div>

              {/* Messages Area */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "0 24px 100px 24px", // Bottom padding for input
                  display: "flex",
                  flexDirection: "column",
                  gap: 32,
                }}
              >
                <div
                  style={{
                    maxWidth: 700,
                    margin: "0 auto",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                  }}
                >
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        flexDirection:
                          msg.role === "user" ? "row-reverse" : "row",
                        gap: 16,
                        alignSelf:
                          msg.role === "user" ? "flex-end" : "flex-start",
                        maxWidth: "100%",
                        width: "100%",
                      }}
                    >
                      {msg.role === "assistant" && (
                        <Avatar
                          src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" // Gemini Icon or similar
                          style={{
                            flexShrink: 0,
                            backgroundColor: "transparent",
                          }}
                        />
                      )}

                      <div
                        style={{
                          maxWidth: "90%",
                          padding: msg.role === "user" ? "12px 20px" : 0,
                          backgroundColor:
                            msg.role === "user"
                              ? isDarkMode
                                ? "#2d2d2d"
                                : "#f0f4f9"
                              : "transparent",
                          borderRadius: 20,
                          color: isDarkMode ? "#e3e3e3" : "#1f1f1f",
                          fontSize: 16,
                          lineHeight: 1.6,
                        }}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  {isSending && (
                    <div style={{ display: "flex", gap: 16 }}>
                      <Avatar
                        src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg"
                        style={{ backgroundColor: "transparent" }}
                        className="spin-animation" // You might need css
                      />
                      <Text type="secondary" style={{ marginTop: 8 }}>
                        Thinking...
                      </Text>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Floating Input Area */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "24px",
                  background: isDarkMode
                    ? "linear-gradient(to top, #131314 80%, transparent)"
                    : "linear-gradient(to top, #fff 80%, transparent)",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: 700,
                    background: isDarkMode ? "#1e1e1e" : "#f0f4f9",
                    borderRadius: 30,
                    padding: "8px 8px 8px 24px",
                    display: "flex",
                    alignItems: "center",
                    boxShadow: "0 0 0 1px transparent", // Can add focus ring
                  }}
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Reply to PM Copilot..."
                    variant="borderless"
                    style={{
                      flex: 1,
                      color: isDarkMode ? "#e3e3e3" : "#1f1f1f",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    type="text"
                    icon={<SendOutlined />}
                    disabled={!input.trim()}
                    onClick={handleSendMessage}
                    style={{ borderRadius: "50%", width: 40, height: 40 }}
                  />
                </div>
              </div>
            </div>
          </Splitter.Panel>

          {/* --- Right Panel: Live Document (Canvas) --- */}
          {sowContent && (
            <Splitter.Panel>
              <div
                style={{
                  height: "100%",
                  overflowY: "auto",
                  padding: 32,
                  background: isDarkMode ? "#1e1e1e" : "#f8f9fa",
                  borderLeft: isDarkMode
                    ? "1px solid #333"
                    : "1px solid #efefef",
                }}
              >
                <div style={{ maxWidth: 800, margin: "0 auto" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 24,
                    }}
                  >
                    <Title level={5} style={{ margin: 0 }}>
                      LIVE DOCUMENT
                    </Title>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button
                        icon={<DownloadOutlined />}
                        disabled={!sowContent}
                        onClick={() => {
                          // Export logic (e.g. PDF download) can be here
                          console.log({ sowContent });
                        }}
                      >
                        Export
                      </Button>
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={showModal}
                      >
                        Create Project
                      </Button>
                    </div>
                  </div>

                  <Card
                    variant={"borderless"}
                    style={{
                      minHeight: "80vh",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
                      borderRadius: 16,
                    }}
                  >
                    <Typography className="sow-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {sowContent}
                      </ReactMarkdown>
                    </Typography>
                  </Card>
                </div>
              </div>
            </Splitter.Panel>
          )}
        </Splitter>

        <Drawer
          title="Chat History"
          placement="left"
          onClose={() => setHistoryOpen(false)}
          open={historyOpen}
          width={320}
          styles={{ body: { padding: 0 } }}
        >
          <List
            dataSource={historyThreads}
            renderItem={(item) => (
              <List.Item
                onClick={() => loadThread(item.thread_id)}
                style={{
                  cursor: "pointer",
                  padding: "12px 16px",
                  borderBottom: "1px solid #f0f0f0",
                }}
                className="history-item"
              >
                <List.Item.Meta
                  title={
                    <Typography.Text ellipsis>{item.title}</Typography.Text>
                  }
                  description={
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(item.updated_at).toLocaleString()}
                    </Typography.Text>
                  }
                />
              </List.Item>
            )}
          />
        </Drawer>

        <Modal
          title="Create New Project"
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{}}
          >
            <Form.Item
              name="name"
              label="Project Name"
              rules={[{ required: true, message: "Please enter project name" }]}
            >
              <Input placeholder="Enter project name" />
            </Form.Item>

            <Form.Item name="client" label="Client Name">
              <Input placeholder="Enter client name" />
            </Form.Item>

            <Form.Item name="budget" label="Budget">
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value?.replace(/\$\s?|(,*)/g, "") as any}
              />
            </Form.Item>

            <Form.Item name="dateRange" label="Project Duration">
              <DatePicker.RangePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description (SOW)"
              rules={[{ required: true, message: "Description is required" }]}
            >
              <TextArea rows={6} />
            </Form.Item>

            <Form.Item>
              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
              >
                <Button onClick={handleCancel}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createLoading}
                >
                  Create
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}
