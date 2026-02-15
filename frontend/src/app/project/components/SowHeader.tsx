"use client";

import React, { useState } from "react";
import { Input, Typography, Button, Space, Tooltip } from "antd";
import { EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { SowProjectInfo } from "../slice/project.types";

const { Title, Text } = Typography;

interface SowHeaderProps {
    projectInfo: SowProjectInfo;
    onUpdateField: (field: keyof SowProjectInfo, value: string) => void;
}

/**
 * Editable header showing project title, client, and version.
 * Each field has an inline-edit toggle.
 */
const SowHeader: React.FC<SowHeaderProps> = ({ projectInfo, onUpdateField }) => {
    const [editingField, setEditingField] = useState<keyof SowProjectInfo | null>(null);
    const [draft, setDraft] = useState("");

    const startEdit = (field: keyof SowProjectInfo) => {
        setEditingField(field);
        setDraft(projectInfo[field]);
    };

    const confirmEdit = () => {
        if (editingField) {
            onUpdateField(editingField, draft);
            setEditingField(null);
        }
    };

    const cancelEdit = () => {
        setEditingField(null);
        setDraft("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") confirmEdit();
        if (e.key === "Escape") cancelEdit();
    };

    const renderField = (field: keyof SowProjectInfo, label: string) => {
        if (editingField === field) {
            return (
                <Space.Compact style={{ width: "100%" }}>
                    <Input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        style={{ flex: 1 }}
                    />
                    <Button icon={<CheckOutlined />} type="primary" onClick={confirmEdit} />
                    <Button icon={<CloseOutlined />} onClick={cancelEdit} />
                </Space.Compact>
            );
        }
        return null;
    };

    return (
        <div
            id="sow-header"
            style={{
                textAlign: "center",
                padding: "32px 24px",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                marginBottom: 8,
            }}
        >
            {/* Title */}
            {editingField === "title" ? (
                <div style={{ maxWidth: 500, margin: "0 auto", marginBottom: 12 }}>
                    {renderField("title", "Title")}
                </div>
            ) : (
                <Tooltip title="Click to edit title">
                    <Title
                        level={2}
                        style={{
                            margin: "0 0 8px 0",
                            cursor: "pointer",
                            transition: "color 0.2s",
                        }}
                        onClick={() => startEdit("title")}
                    >
                        {projectInfo.title || "Untitled Project"}
                        <EditOutlined
                            style={{
                                fontSize: 16,
                                marginLeft: 8,
                                opacity: 0.4,
                            }}
                        />
                    </Title>
                </Tooltip>
            )}

            {/* Client */}
            {editingField === "client" ? (
                <div style={{ maxWidth: 400, margin: "0 auto", marginBottom: 8 }}>
                    {renderField("client", "Client")}
                </div>
            ) : (
                <Tooltip title="Click to edit client">
                    <Text
                        type="secondary"
                        style={{ cursor: "pointer", fontSize: 15 }}
                        onClick={() => startEdit("client")}
                    >
                        Client: {projectInfo.client || "N/A"}
                        <EditOutlined style={{ fontSize: 12, marginLeft: 6, opacity: 0.4 }} />
                    </Text>
                </Tooltip>
            )}
            <br />

            {/* Version */}
            {editingField === "version" ? (
                <div style={{ maxWidth: 300, margin: "8px auto 0" }}>
                    {renderField("version", "Version")}
                </div>
            ) : (
                <Tooltip title="Click to edit version">
                    <Text
                        type="secondary"
                        style={{
                            cursor: "pointer",
                            fontSize: 13,
                            padding: "2px 10px",
                            borderRadius: 4,
                            background: "rgba(25, 110, 230, 0.08)",
                            color: "#196ee6",
                            display: "inline-block",
                            marginTop: 8,
                        }}
                        onClick={() => startEdit("version")}
                    >
                        {projectInfo.version || "v1.0"}
                        <EditOutlined style={{ fontSize: 10, marginLeft: 4, opacity: 0.5 }} />
                    </Text>
                </Tooltip>
            )}
        </div>
    );
};

export default SowHeader;
