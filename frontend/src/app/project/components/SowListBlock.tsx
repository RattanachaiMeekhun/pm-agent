"use client";

import React from "react";
import { Input, Button, Typography, Space } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

interface SowListBlockProps {
    items: string[];
    editing: boolean;
    onUpdateItem: (index: number, value: string) => void;
    onAddItem: () => void;
    onRemoveItem: (index: number) => void;
}

/**
 * Renders a list-type SOW block.
 * In edit mode: each item is an editable input with add/remove.
 * In view mode: a clean styled list using plain elements.
 */
const SowListBlock: React.FC<SowListBlockProps> = ({
    items,
    editing,
    onUpdateItem,
    onAddItem,
    onRemoveItem,
}) => {
    if (editing) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((item, index) => (
                    <Space.Compact key={index} style={{ width: "100%" }}>
                        <Input
                            value={item}
                            onChange={(e) => onUpdateItem(index, e.target.value)}
                            placeholder={`Item ${index + 1}`}
                            style={{ flex: 1 }}
                        />
                        <Button
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => onRemoveItem(index)}
                            disabled={items.length <= 1}
                        />
                    </Space.Compact>
                ))}
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={onAddItem}
                    style={{ marginTop: 4 }}
                    block
                >
                    Add Item
                </Button>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            {items.map((item, index) => (
                <div
                    key={index}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: "1px solid rgba(0,0,0,0.04)",
                    }}
                >
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "rgba(25, 110, 230, 0.08)",
                            color: "#196ee6",
                            fontSize: 12,
                            fontWeight: 600,
                            marginRight: 12,
                        }}
                    >
                        {index + 1}
                    </span>
                    <Typography.Text>{item}</Typography.Text>
                </div>
            ))}
        </div>
    );
};

export default SowListBlock;
