"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Radio, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { SowBlock } from "../slice/project.types";

interface AddBlockModalProps {
    onAdd: (block: SowBlock) => void;
}

/**
 * Button + Modal to add a new SOW block.
 * User specifies section name, title, and content type.
 */
const AddBlockModal: React.FC<AddBlockModalProps> = ({ onAdd }) => {
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            const block: SowBlock = {
                section: values.section,
                title: values.title,
                content_type: values.content_type,
                data:
                    values.content_type === "text"
                        ? ""
                        : values.content_type === "list"
                          ? [""]
                          : { headers: ["Column 1", "Column 2"], rows: [["", ""]] },
            };
            onAdd(block);
            form.resetFields();
            setOpen(false);
        });
    };

    return (
        <>
            <Button
                id="add-sow-block-btn"
                type="dashed"
                icon={<PlusOutlined />}
                block
                size="large"
                style={{
                    borderRadius: 12,
                    height: 56,
                    fontSize: 15,
                    fontWeight: 500,
                }}
                onClick={() => setOpen(true)}
            >
                Add New Section
            </Button>

            <Modal
                title="Add New Section"
                open={open}
                onCancel={() => setOpen(false)}
                onOk={handleSubmit}
                okText="Add Section"
            >
                <Form form={form} layout="vertical" initialValues={{ content_type: "text" }}>
                    <Form.Item
                        name="section"
                        label="Section Number / ID"
                        rules={[{ required: true, message: "Please enter section ID" }]}
                    >
                        <Input placeholder='e.g. "6" or "6.1"' />
                    </Form.Item>
                    <Form.Item
                        name="title"
                        label="Section Title"
                        rules={[{ required: true, message: "Please enter title" }]}
                    >
                        <Input placeholder="e.g. Acceptance Criteria" />
                    </Form.Item>
                    <Form.Item name="content_type" label="Content Type">
                        <Radio.Group buttonStyle="solid">
                            <Radio.Button value="text">Text</Radio.Button>
                            <Radio.Button value="list">List</Radio.Button>
                            <Radio.Button value="table">Table</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default AddBlockModal;
