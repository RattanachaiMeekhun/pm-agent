"use client";

import { useState } from "react";
import FloatingLines from "@/components/layout/reactbits/FloatingLinest";
import { Button, Form, Input, Typography } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { motion, AnimatePresence, Variants } from "framer-motion";
import loginThunk from "./slice/auth.thunks";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";

const { Title, Text } = Typography;

const LoginPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  const onFinish = async (values: any) => {
    const res = await dispatch(loginThunk(values));
    if (res.meta.requestStatus === "fulfilled") {
      router.push("/dashboard");
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  // Animation variants
  const formVariants: Variants = {
    hidden: { opacity: 0, x: isLogin ? -20 : 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      x: isLogin ? 20 : -20,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100dvh",
        position: "relative",
        background: "var(--bg-primary)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          zIndex: 0,
          width: "100%",
          height: "100%",
          opacity: 0.5,
        }}
      >
        <FloatingLines
          enabledWaves={["top", "middle", "bottom"]}
          lineCount={5}
          lineDistance={5}
          bendRadius={5}
          bendStrength={-0.5}
          parallax={true}
          mixBlendMode="screen"
          interactive={false}
        />
      </div>

      <motion.div
        style={{ zIndex: 1, position: "relative" }}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          style={{
            width: "380px",
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "24px",
            border: "1px solid var(--border-color)",
            boxShadow:
              "0 24px 48px rgba(0,0,0,0.05), 0 8px 16px rgba(0,0,0,0.02)",
            padding: "48px 40px",
            overflow: "hidden",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <motion.div layout>
              <Title
                level={2}
                style={{
                  margin: 0,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.5px",
                }}
              >
                {isLogin ? "Welcome Back" : "Create Account"}
              </Title>
              <Text
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  marginTop: "8px",
                  display: "inline-block",
                }}
              >
                {isLogin
                  ? "Sign in to access your projects"
                  : "Sign up to start your journey"}
              </Text>
            </motion.div>
          </div>

          <div
            style={{
              display: "flex",
              background: "var(--bg-secondary)",
              borderRadius: "12px",
              padding: "4px",
              marginBottom: "32px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "4px",
                bottom: "4px",
                left: isLogin ? "4px" : "calc(50% + 2px)",
                width: "calc(50% - 6px)",
                background: "var(--bg-primary)",
                borderRadius: "8px",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
            <div
              onClick={() => setIsLogin(true)}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "8px 0",
                cursor: "pointer",
                fontWeight: isLogin ? 600 : 500,
                color: isLogin
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
                position: "relative",
                zIndex: 1,
                transition: "color 0.4s ease",
                userSelect: "none",
              }}
            >
              Login
            </div>
            <div
              onClick={() => setIsLogin(false)}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "8px 0",
                cursor: "pointer",
                fontWeight: !isLogin ? 600 : 500,
                color: !isLogin
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
                position: "relative",
                zIndex: 1,
                transition: "color 0.4s ease",
                userSelect: "none",
              }}
            >
              Register
            </div>
          </div>

          <motion.div
            animate={{ height: isLogin ? 240 : 300 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ position: "relative" }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isLogin ? (
                <motion.div
                  key="login-form"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{ position: "absolute", width: "100%" }}
                >
                  <Form
                    name="login"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    size="large"
                    requiredMark={false}
                  >
                    <Form.Item
                      name="username"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your username",
                        },
                      ]}
                      style={{ marginBottom: "20px" }}
                    >
                      <Input
                        prefix={
                          <UserOutlined
                            style={{ color: "var(--text-secondary)" }}
                          />
                        }
                        placeholder="Username or Email"
                        style={{ borderRadius: "10px" }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your password",
                        },
                      ]}
                      style={{ marginBottom: "16px" }}
                    >
                      <Input.Password
                        prefix={
                          <LockOutlined
                            style={{ color: "var(--text-secondary)" }}
                          />
                        }
                        placeholder="Password"
                        style={{ borderRadius: "10px" }}
                      />
                    </Form.Item>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginBottom: "24px",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "13px",
                          cursor: "pointer",
                          color: "var(--text-secondary)",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "var(--text-primary)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color =
                            "var(--text-secondary)")
                        }
                      >
                        Forgot Password?
                      </Text>
                    </div>

                    <Form.Item style={{ marginBottom: 0 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        block
                        style={{
                          height: "48px",
                          borderRadius: "12px",
                          fontWeight: 600,
                          fontSize: "16px",
                          boxShadow: "0 4px 14px 0 var(--primary-glow)",
                        }}
                      >
                        Sign In
                      </Button>
                    </Form.Item>
                  </Form>
                </motion.div>
              ) : (
                <motion.div
                  key="register-form"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{ position: "absolute", width: "100%" }}
                >
                  <Form
                    name="register"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    size="large"
                    requiredMark={false}
                  >
                    <Form.Item
                      name="email"
                      rules={[
                        { required: true, message: "Please enter your email" },
                        {
                          type: "email",
                          message: "Please enter a valid email address",
                        },
                      ]}
                      style={{ marginBottom: "16px" }}
                    >
                      <Input
                        prefix={
                          <MailOutlined
                            style={{ color: "var(--text-secondary)" }}
                          />
                        }
                        placeholder="Email Address"
                        style={{ borderRadius: "10px" }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="username"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your username",
                        },
                      ]}
                      style={{ marginBottom: "16px" }}
                    >
                      <Input
                        prefix={
                          <UserOutlined
                            style={{ color: "var(--text-secondary)" }}
                          />
                        }
                        placeholder="Username"
                        style={{ borderRadius: "10px" }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      rules={[
                        { required: true, message: "Please create a password" },
                        {
                          min: 8,
                          message: "Password must be at least 8 characters",
                        },
                      ]}
                      style={{ marginBottom: "28px" }}
                    >
                      <Input.Password
                        prefix={
                          <LockOutlined
                            style={{ color: "var(--text-secondary)" }}
                          />
                        }
                        placeholder="Create Password"
                        style={{ borderRadius: "10px" }}
                      />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        block
                        style={{
                          height: "48px",
                          borderRadius: "12px",
                          fontWeight: 600,
                          fontSize: "16px",
                          boxShadow: "0 4px 14px 0 var(--primary-glow)",
                        }}
                      >
                        Create Account
                      </Button>
                    </Form.Item>
                  </Form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
