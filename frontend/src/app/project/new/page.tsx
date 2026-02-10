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
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  RobotOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { useTheme } from "@/providers/ThemeProvider";

const { Content } = Layout;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sowContent, setSowContent] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const { isDarkMode } = useTheme();
  const { token } = theme.useToken();

  useEffect(() => {
    const newThreadId = crypto.randomUUID();
    setThreadId(newThreadId);

    const initialMsg = searchParams.get("msg");
    const project = searchParams.get("project");

    if (initialMsg && !initialized.current) {
      initialized.current = true;
      setMessages([
        {
          role: "assistant",
          content: `Starting project "**${project || "New Project"}**"...\n\nAnalyzing your requirements...`,
        },
      ]);
      sendInitialMessage(initialMsg, newThreadId);
    } else if (!initialized.current) {
      initialized.current = true;
      setMessages([
        {
          role: "assistant",
          content:
            "**Hello! I am your PM Copilot.**\n\nPlease tell me about the project you want to build. I'll help you define the requirements and generate a professional Scope of Work (SOW).",
        },
      ]);
    }
  }, []);

  const sendInitialMessage = async (msg: string, tId: string) => {
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/project/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, thread_id: tId }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
      if (
        data.stage === "writer" ||
        (data.response && data.response.toLowerCase().includes("sow"))
      ) {
        // Pass tId specifically because state might stale in closure
        fetchSow(tId);
      }
    } catch (e) {
      console.error(e);
      antMessage.error("Failed to start conversation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/project/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, thread_id: threadId }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
      if (
        data.stage === "writer" ||
        (data.response && data.response.toLowerCase().includes("sow"))
      ) {
        fetchSow(threadId);
      }
    } catch (error) {
      console.error("Error:", error);
      antMessage.error("Failed to get response.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSow = async (tId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/sow/${tId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === "completed" && data.sow_content) {
          setSowContent(data.sow_content);
          antMessage.success("Scope of Work generated!");
        }
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
                }}
              >
                <Button
                  icon={<ArrowLeftOutlined />}
                  type="text"
                  onClick={() => router.push("/dashboard")}
                >
                  Back
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
                  {loading && (
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
                    bordered={false}
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
                    <Button icon={<DownloadOutlined />} disabled={!sowContent}>
                      Export
                    </Button>
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
      </div>
    </MainLayout>
  );
}
