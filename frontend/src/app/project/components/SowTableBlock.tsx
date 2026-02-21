"use client";

import React from "react";
import { Input, Button, Table, Space } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { SowTableData } from "../slice/project.types";

interface SowTableBlockProps {
    tableData: SowTableData;
    editing: boolean;
    onUpdateCell: (rowIndex: number, colIndex: number, value: string) => void;
    onAddRow: () => void;
    onRemoveRow: (rowIndex: number) => void;
}

/**
 * Renders a table-type SOW block.
 * Edit mode: cells become inline inputs, with add/remove row controls.
 * View mode: standard Ant Design table.
 */
const SowTableBlock: React.FC<SowTableBlockProps> = ({
    tableData,
    editing,
    onUpdateCell,
    onAddRow,
    onRemoveRow,
}) => {
    const { headers, rows } = tableData;

    if (editing) {
        const columns = [
            ...headers.map((h, colIdx) => ({
                title: h,
                dataIndex: `col_${colIdx}`,
                key: `col_${colIdx}`,
                render: (_: any, __: any, rowIdx: number) => (
                    <Input
                        size="small"
                        value={rows[rowIdx]?.[colIdx] ?? ""}
                        onChange={(e) => onUpdateCell(rowIdx, colIdx, e.target.value)}
                        style={{ minWidth: 80 }}
                    />
                ),
            })),
            {
                title: "",
                key: "actions",
                width: 50,
                render: (_: any, __: any, rowIdx: number) => (
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        type="text"
                        size="small"
                        onClick={() => onRemoveRow(rowIdx)}
                        disabled={rows.length <= 1}
                    />
                ),
            },
        ];

        const dataSource = rows.map((_, i) => ({ key: i }));

        return (
            <div>
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    pagination={false}
                    size="small"
                    bordered
                    style={{ marginBottom: 8 }}
                />
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={onAddRow}
                    block
                    size="small"
                >
                    Add Row
                </Button>
            </div>
        );
    }

    // View mode
    const viewColumns = headers.map((h) => ({
        title: h,
        dataIndex: h,
        key: h,
    }));

    const viewData = rows.map((row, i) => {
        const obj: Record<string, any> = { key: i };
        headers.forEach((h, idx) => {
            obj[h] = row[idx] ?? "";
        });
        return obj;
    });

    return (
        <Table
            dataSource={viewData}
            columns={viewColumns}
            pagination={false}
            size="small"
            bordered
        />
    );
};

export default SowTableBlock;
