"use client";

import React, { useState } from "react";
import { Card, Input, Button, Space, Tooltip, Typography } from "antd";
import {
    EditOutlined,
    CheckOutlined,
    DeleteOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
} from "@ant-design/icons";
import { SowBlock, SowTableData } from "../../slice/project.types";
import SowTextBlock from "./SowTextBlock";
import SowListBlock from "./SowListBlock";
import SowTableBlock from "./SowTableBlock";

interface SowBlockCardProps {
    block: SowBlock;
    blockIndex: number;
    isFirst: boolean;
    isLast: boolean;
    onUpdateTitle: (title: string) => void;
    onUpdateText: (text: string) => void;
    onUpdateListItem: (itemIndex: number, value: string) => void;
    onAddListItem: () => void;
    onRemoveListItem: (itemIndex: number) => void;
    onUpdateTableCell: (rowIndex: number, colIndex: number, value: string) => void;
    onAddTableRow: () => void;
    onRemoveTableRow: (rowIndex: number) => void;
    onRemoveBlock: () => void;
    onMoveBlock: (direction: "up" | "down") => void;
}

/**
 * Wraps a single SOW block with a card UI, inline title editing,
 * reorder/delete controls, and delegates content rendering to typed sub-components.
 */
const SowBlockCard: React.FC<SowBlockCardProps> = ({
    block,
    blockIndex,
    isFirst,
    isLast,
    onUpdateTitle,
    onUpdateText,
    onUpdateListItem,
    onAddListItem,
    onRemoveListItem,
    onUpdateTableCell,
    onAddTableRow,
    onRemoveTableRow,
    onRemoveBlock,
    onMoveBlock,
}) => {
    const [editing, setEditing] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState("");

    const startEditTitle = () => {
        setEditingTitle(true);
        setTitleDraft(block.title);
    };

    const confirmTitle = () => {
        onUpdateTitle(titleDraft);
        setEditingTitle(false);
    };

    const sectionTag = (
        <Typography.Text
            type="secondary"
            style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 1,
                fontWeight: 600,
            }}
        >
            {block.section}
        </Typography.Text>
    );

    const titleContent = editingTitle ? (
        <Space.Compact style={{ width: "100%", maxWidth: 400 }}>
            <Input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onPressEnter={confirmTitle}
                onKeyDown={(e) => e.key === "Escape" && setEditingTitle(false)}
                autoFocus
                size="small"
            />
            <Button
                icon={<CheckOutlined />}
                size="small"
                type="primary"
                onClick={confirmTitle}
            />
        </Space.Compact>
    ) : (
        <Tooltip title="Click to edit section title">
            <span
                style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={startEditTitle}
            >
                {block.title}
                <EditOutlined style={{ fontSize: 12, opacity: 0.35 }} />
            </span>
        </Tooltip>
    );

    const extraControls = (
        <Space size={4}>
            <Tooltip title={editing ? "Done editing" : "Edit content"}>
                <Button
                    icon={editing ? <CheckOutlined /> : <EditOutlined />}
                    type={editing ? "primary" : "text"}
                    size="small"
                    onClick={() => setEditing(!editing)}
                />
            </Tooltip>
            <Tooltip title="Move up">
                <Button
                    icon={<ArrowUpOutlined />}
                    type="text"
                    size="small"
                    disabled={isFirst}
                    onClick={() => onMoveBlock("up")}
                />
            </Tooltip>
            <Tooltip title="Move down">
                <Button
                    icon={<ArrowDownOutlined />}
                    type="text"
                    size="small"
                    disabled={isLast}
                    onClick={() => onMoveBlock("down")}
                />
            </Tooltip>
            <Tooltip title="Remove section">
                <Button
                    icon={<DeleteOutlined />}
                    type="text"
                    danger
                    size="small"
                    onClick={onRemoveBlock}
                />
            </Tooltip>
        </Space>
    );

    return (
        <Card
            id={`sow-block-${blockIndex}`}
            title={
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {sectionTag}
                    {titleContent}
                </div>
            }
            extra={extraControls}
            style={{
                borderRadius: 12,
                border: editing ? "1px solid #196ee6" : "1px solid rgba(0,0,0,0.06)",
                transition: "border-color 0.3s, box-shadow 0.3s",
                boxShadow: editing
                    ? "0 0 0 2px rgba(25, 110, 230, 0.1)"
                    : "0 1px 4px rgba(0,0,0,0.04)",
            }}
        >
            {block.content_type === "text" && (
                <SowTextBlock
                    text={block.data as string}
                    editing={editing}
                    onChange={onUpdateText}
                />
            )}
            {block.content_type === "list" && (
                <SowListBlock
                    items={block.data as string[]}
                    editing={editing}
                    onUpdateItem={onUpdateListItem}
                    onAddItem={onAddListItem}
                    onRemoveItem={onRemoveListItem}
                />
            )}
            {block.content_type === "table" && (
                <SowTableBlock
                    tableData={block.data as SowTableData}
                    editing={editing}
                    onUpdateCell={onUpdateTableCell}
                    onAddRow={onAddTableRow}
                    onRemoveRow={onRemoveTableRow}
                />
            )}
        </Card>
    );
};

export default SowBlockCard;
