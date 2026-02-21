"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import {
  Input,
  Button,
  Avatar,
  Typography,
  Card,
  Splitter,
  message as antMessage,
  theme,
  Modal,
  Form,
  Drawer,
  Tag,
  Table,
} from "antd";
import {
  SendOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./newproject.module.css";
import MainLayout from "@/components/layout/MainLayout";
import { useTheme } from "@/providers/ThemeProvider";

import api from "@/lib/Axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

interface SowBlock {
  section: string;
  title: string;
  content_type: "text" | "list" | "table";
  data: any;
}

interface SowData {
  project_info: {
    title: string;
    client: string;
    version: string;
  };
  sow_blocks: SowBlock[];
}

const SowRenderer = ({ data }: { data: SowData }) => {
  return (
    <div className="sow-structured">
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <Title level={2}>{data.project_info.title}</Title>
        <Text type="secondary">Client: {data.project_info.client}</Text>
        <br />
        <Tag color="blue">{data.project_info.version}</Tag>
      </div>

      {data.sow_blocks.map((block, idx) => (
        <Card key={idx} style={{ marginBottom: 24 }} title={block.title}>
          {block.content_type === "text" && (
            <Typography.Paragraph>{block.data}</Typography.Paragraph>
          )}
          
          {block.content_type === "list" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(block.data as string[]).map((item, i) => (
                <div key={i} style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>
                  <Typography.Text>{item}</Typography.Text>
                </div>
              ))}
            </div>
          )}

          {block.content_type === "table" && (
            <Table
              dataSource={(block.data.rows || []).map((row: string[], i: number) => {
                const obj: any = { key: i };
                block.data.headers.forEach((h: string, index: number) => {
                  obj[h] = row[index];
                });
                return obj;
              })}
              columns={(block.data.headers || []).map((h: string) => ({
                title: h,
                dataIndex: h,
                key: h,
              }))}
              pagination={false}
              size="small"
              bordered
            />
          )}
        </Card>
      ))}
    </div>
  );
};

function NewProjectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sowContent, setSowContent] = useState<string | SowData | null>(null);
  const [threadId, setThreadId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyThreads, setHistoryThreads] = useState<ChatThread[]>([]);
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalOpen(true);
    if (sowContent && typeof sowContent === 'object') {
      const sow = sowContent as SowData;
      form.setFieldsValue({
        name: sow.project_info?.title || '',
        client: sow.project_info?.client || 'Undisclosed',
      });
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (values: any) => {
    setCreateLoading(true);
    try {
      // Merge form values into sow_structured
      let sowData = sowContent;
      if (sowData && typeof sowData === 'object') {
        sowData = {
          ...(sowData as SowData),
          project_info: {
            ...(sowData as SowData).project_info,
            title: values.name || (sowData as SowData).project_info?.title,
            client: values.client || (sowData as SowData).project_info?.client,
          },
        };
      }

      const payload = {
        thread_id: threadId,
        sow_structured: sowData || null,
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
  const [isSending, setIsSending] = useState(false);

  const { isDarkMode } = useTheme();
  const { token } = theme.useToken();

  const sendMessage = useCallback(async ({ msg, tId }: { msg: string; tId: string }) => {
    setIsSending(true);
    try {
      const { data } = await api.post("/api/v1/project/consult", {
        message: msg,
        thread_id: tId,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);

      
      //Always fetch SOW to let user review and confirm
      fetchSow(tId);
      
    } catch { 
      setInput(msg);
      antMessage.error("Failed to get response.");
    } finally { 
      setIsSending(false);
    }
  }, []);

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
      if (data.sow_content) {
        setSowContent(data.sow_content);
        antMessage.success("Scope of Work generated!");
      }
    } catch (error) {
      console.error("Error fetching SOW:", error);
    }
  };

  return (
    <MainLayout>
      <div className={styles.chatLayout}>
        <Splitter style={{ flex: 1, border: 'none' }}>
          {/* --- Left Panel: Chat (Gemini Style) --- */}
          <Splitter.Panel defaultSize="45%" min="30%" max="70%">
            <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
              {/* Header for Back Button */}
              <div className={styles.chatHeader}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  type="text"
                  onClick={() => router.push("/dashboard")}
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Back
                </Button>
                <Button
                  icon={<HistoryOutlined />}
                  type="text"
                  onClick={openHistory}
                  style={{ color: 'var(--text-secondary)' }}
                >
                  History
                </Button>
              </div>

              {/* Messages Area */}
              <div className={styles.messagesArea}>
                <div className={styles.messagesContainer}>
                  {messages.map((msg, index) => {
                    const isUser = msg.role === "user";
                    return (
                      <div
                        key={index}
                        className={`${styles.messageRow} ${isUser ? styles.userMessage : styles.assistantMessage}`}
                      >
                        {!isUser && (
                          <div className={`${styles.avatar} ${styles.assistantAvatar}`}>
                            ★
                          </div>
                        )}

                        <div className={`${styles.messageBubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    );
                  })}
                  
                  {isSending && (
                    <div className={`${styles.messageRow} ${styles.assistantMessage}`}>
                      <div className={`${styles.avatar} ${styles.assistantAvatar}`} style={{ animation: 'spin 2s linear infinite' }}>
                        ★
                      </div>
                      <div className={styles.messageBubble} style={{ display: 'flex', alignItems: 'center' }}>
                        <Text type="secondary" style={{ marginTop: 2 }}>
                          Thinking...
                        </Text>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Floating Input Area */}
              <div className={styles.inputArea}>
                <div className={styles.inputContainer}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Reply to PM Copilot..."
                    className={styles.inputField}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    className={styles.sendButton}
                    disabled={!input.trim()}
                    onClick={handleSendMessage}
                  >
                    <SendOutlined />
                  </button>
                </div>
              </div>
            </div>
          </Splitter.Panel>

          {/* --- Right Panel: Live Document (Canvas) --- */}
          {sowContent && (
            <Splitter.Panel>
              <div className={styles.docPanel}>
                <div className={styles.docHeader}>
                  <h2 className={styles.docTitle}>
                    LIVE DOCUMENT
                  </h2>
                  <div style={{ display: "flex", gap: 12 }}>
                    <Button
                      icon={<DownloadOutlined />}
                      disabled={!sowContent}
                      onClick={() => {
                        console.log({ sowContent });
                      }}
                      style={{ borderRadius: 8 }}
                    >
                      Export
                    </Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={showModal}
                      style={{ borderRadius: 8, background: '#111827', color: '#fff' }}
                    >
                      Create Project
                    </Button>
                  </div>
                </div>

                <div className={styles.docContent}>
                  <div className={styles.docCard}>
                    <Typography className="sow-markdown">
                      {typeof sowContent === "string" ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {sowContent}
                        </ReactMarkdown>
                      ) : (
                        <SowRenderer data={sowContent as SowData} />
                      )}
                    </Typography>
                  </div>
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
          size={"large"}
          styles={{ body: { padding: 0 } }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {historyThreads.map((item) => (
              <div
                key={item.thread_id}
                onClick={() => loadThread(item.thread_id)}
                style={{
                  cursor: "pointer",
                  padding: "16px 24px",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  transition: 'background 0.2s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Typography.Text ellipsis style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {new Date(item.updated_at).toLocaleString()}
                </Typography.Text>
              </div>
            ))}
          </div>
        </Drawer>

        <Modal
          title="Create New Project"
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          width={600}
          centered
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{}}
            style={{ marginTop: 24 }}
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

            {sowContent && typeof sowContent === 'object' && (
              <Card
                size="small"
                title={<span style={{ fontWeight: 600 }}>SOW Preview</span>}
                style={{ marginBottom: 24, borderRadius: 12, border: '1px solid var(--border-color)' }}
                headStyle={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
              >
                <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                  <span style={{ color: 'var(--text-primary)' }}>Version:</span> {(sowContent as SowData).project_info?.version}
                </Typography.Paragraph>
                <Typography.Paragraph type="secondary" style={{ margin: 0, marginTop: 8 }}>
                  <span style={{ color: 'var(--text-primary)' }}>Sections:</span> {(sowContent as SowData).sow_blocks?.length || 0} blocks
                </Typography.Paragraph>
              </Card>
            )}

            <Form.Item style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <Button onClick={handleCancel} style={{ borderRadius: 8 }}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createLoading}
                  style={{ borderRadius: 8, background: '#111827', color: '#fff' }}
                >
                  Create Project
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={<div style={{ padding: 48, textAlign: 'center' }}>Loading project environment...</div>}>
      <NewProjectContent />
    </Suspense>
  );
}
