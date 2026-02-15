"use client";

import React from "react";
import { Input, Typography } from "antd";

const { Paragraph } = Typography;

interface SowTextBlockProps {
    text: string;
    editing: boolean;
    onChange: (text: string) => void;
}

/**
 * Renders a text-type SOW block.
 * In edit mode: shows a textarea.
 * In view mode: shows the text as a paragraph.
 */
const SowTextBlock: React.FC<SowTextBlockProps> = ({ text, editing, onChange }) => {
    if (editing) {
        return (
            <Input.TextArea
                value={text}
                onChange={(e) => onChange(e.target.value)}
                autoSize={{ minRows: 3, maxRows: 12 }}
                style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    borderRadius: 8,
                }}
            />
        );
    }

    return (
        <Paragraph
            style={{
                fontSize: 14,
                lineHeight: 1.8,
                margin: 0,
                whiteSpace: "pre-wrap",
            }}
        >
            {text}
        </Paragraph>
    );
};

export default SowTextBlock;
